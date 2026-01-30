import torch
import torch.nn as nn
try:
    import segmentation_models_pytorch as smp
except ImportError:
    # Fallback/Mock for environment without GPU libs installed
    smp = None

class LULCClassifier:
    def __init__(self, n_classes=5, encoder='resnet34'):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        if smp:
            self.model = smp.UnetPlusPlus(
                encoder_name=encoder,
                encoder_weights='imagenet',
                in_channels=4,  # R, G, B, NIR
                classes=n_classes
            )
            self.model.to(self.device)
        else:
            print("Warning: segmentation_models_pytorch not installed. Model will not function.")
            self.model = None

    def predict(self, image_tensor):
        if not self.model:
            return None
        self.model.eval()
        with torch.no_grad():
            logits = self.model(image_tensor.to(self.device))
            return torch.argmax(logits, dim=1)
