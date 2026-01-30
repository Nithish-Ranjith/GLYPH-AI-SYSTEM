import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

class ChangeDetector:
    def __init__(self, classes):
        self.classes = classes
        self.n_classes = len(classes)
    
    def compute_transition_matrix(self, mask_t1, mask_t2):
        """Compute class-to-class transition matrix"""
        transition_matrix = np.zeros((self.n_classes, self.n_classes))
        for i in range(self.n_classes):
            for j in range(self.n_classes):
                mask = (mask_t1 == i) & (mask_t2 == j)
                transition_matrix[i, j] = np.sum(mask)
        return pd.DataFrame(transition_matrix, index=self.classes, columns=self.classes)

class UrbanGrowthPredictor:
    def __init__(self):
        self.models = {}
        self.classes = ['Forest', 'Water', 'Agriculture', 'Barren', 'Built-up']
    
    def fit_growth_model(self, historical_data: dict):
        """
        historical_data: { year: { class_name: area_ha } }
        """
        for land_class in self.classes:
            years = []
            areas = []
            for year, lulc_areas in sorted(historical_data.items()):
                years.append(year)
                areas.append(lulc_areas.get(land_class, 0))
            
            if len(years) > 1:
                model = LinearRegression()
                X = np.array(years).reshape(-1, 1)
                y = np.array(areas)
                model.fit(X, y)
                self.models[land_class] = model
    
    def predict_with_uncertainty(self, target_year):
        predictions = {}
        for land_class in self.classes:
            if land_class in self.models:
                model = self.models[land_class]
                pred_area = model.predict([[target_year]])[0]
                pred_area = max(0, pred_area)
                
                # Synthetic uncertainty interval for demo
                margin = pred_area * 0.15 
                predictions[land_class] = {
                    'prediction': round(pred_area, 1),
                    'lower_bound': round(pred_area - margin, 1),
                    'upper_bound': round(pred_area + margin, 1)
                }
            else:
                predictions[land_class] = {'prediction': 0, 'lower_bound': 0, 'upper_bound': 0}
        return predictions
