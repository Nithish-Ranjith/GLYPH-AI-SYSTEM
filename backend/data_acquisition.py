
import os
try:
    import ee
except ImportError:
    ee = None

class SatelliteDataManager:
    def __init__(self, aoi_geometry, start_date, end_date):
        """
        aoi_geometry: ee.Geometry.Polygon or list of coordinates
        start_date: 'YYYY-MM-DD'
        end_date: 'YYYY-MM-DD'
        """
        self.aoi = aoi_geometry
        self.start_date = start_date
        self.end_date = end_date
        self.initialized = False
        
        if ee:
            try:
                # In production, use service account credentials:
                # ee.Initialize(credentials=ee.ServiceAccountCredentials(...))
                ee.Initialize() 
                self.initialized = True
            except Exception as e:
                print(f"Earth Engine initialization failed: {e}")
    
    # --- SENTINEL-2 (OPTICAL) PIPELINE ---
    def get_sentinel2_pipeline(self, max_cloud_cover=20):
        if not self.initialized: return None
            
        def mask_s2_clouds(image):
            qa = image.select('QA60')
            # Bits 10 and 11 are clouds and cirrus, respectively.
            cloudBitMask = 1 << 10
            cirrusBitMask = 1 << 11
            # Both flags should be set to zero, indicating clear conditions.
            mask = qa.bitwiseAnd(cloudBitMask).eq(0).And(qa.bitwiseAnd(cirrusBitMask).eq(0))
            return image.updateMask(mask).divide(10000).copyProperties(image, ["system:time_start"])
        
        dataset = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                     .filterBounds(self.aoi)
                     .filterDate(self.start_date, self.end_date)
                     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', max_cloud_cover))
                     .map(mask_s2_clouds))
        
        # Calculate NDVI
        def add_ndvi(image):
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            return image.addBands(ndvi)

        return dataset.map(add_ndvi).median().clip(self.aoi)

    # --- SENTINEL-1 (SAR) PIPELINE ---
    def get_sentinel1_pipeline(self):
        """
        Returns processed SAR data (VH/VV Backscatter).
        Useful for flood detection (water is dark/smooth) and urban structure (bright/double-bounce).
        """
        if not self.initialized: return None

        dataset = (ee.ImageCollection('COPERNICUS/S1_GRD')
                   .filterBounds(self.aoi)
                   .filterDate(self.start_date, self.end_date)
                   .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                   .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                   .filter(ee.Filter.eq('instrumentMode', 'IW')))
        
        # Filter for ascending orbit (consistent viewing angle)
        ascending = dataset.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
        
        # Apply Thermal Noise Removal & Terrain Correction (simulated as these are pre-processed in GRD, 
        # but often need Refined Lee filter in post-processing steps)
        
        # Simple temporal composite to reduce speckle noise
        composite = ascending.select(['VV', 'VH']).mean().clip(self.aoi)
        
        return composite

    # --- EXPORT UTILS ---
    def get_map_id(self, layer_type='s2'):
        """
        Returns tile URL for frontend leafet map.
        """
        if not self.initialized:
            return None

        if layer_type == 's2':
            image = self.get_sentinel2_pipeline()
            # RGB Visualization parameters
            vis_params = {'min': 0.0, 'max': 0.3, 'bands': ['B4', 'B3', 'B2']}
            return image.getMapId(vis_params)
            
        elif layer_type == 's1':
            image = self.get_sentinel1_pipeline()
            # SAR Visualization: VH is good for volume scattering (vegetation/urban)
            vis_params = {'min': -25, 'max': 5, 'bands': ['VH']}
            return image.getMapId(vis_params)
            
        return None
