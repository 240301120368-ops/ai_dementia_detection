import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.impute import SimpleImputer
import joblib
import os
import numpy as np

# Define paths
DATA_PATHS = [
    os.path.join(os.path.dirname(__file__), '..', 'data', 'dementia_data.csv'),
    os.path.join(os.path.dirname(__file__), '..', 'data', 'dementia_patients_health_data.csv'),
    os.path.join(os.path.dirname(__file__), '..', 'data', 'Healthcare.csv')
]
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), '..', 'saved_models', 'dementia_model.pkl')

def train_model():
    """
    This function trains a logistic regression model on the dementia dataset.
    """
    # Load and combine the datasets
    dfs = []
    for path in DATA_PATHS:
        if not os.path.exists(path):
            print(f"Data file not found at {path}")
            # Create a dummy dataframe with 40 features to match the audio processor
            num_features = 40
            num_samples = 200
            features = {f'feature_{i}': np.random.rand(num_samples) for i in range(num_features)}
            features['target'] = np.random.randint(0, 2, num_samples)
            df = pd.DataFrame(features)
            df.to_csv(path, index=False)
            print(f"Created a dummy data file at {path}")
        
        dfs.append(pd.read_csv(path))

    df = pd.concat(dfs, ignore_index=True)

    # Simple preprocessing
    # Assuming 'target' is the name of the target column in all CSVs
    # If not, this will need to be adjusted
    if 'target' not in df.columns:
        raise ValueError("Target column 'target' not found in the combined dataframe.")

    df = df.dropna(subset=['target'])
    
    # Handle the 'Diabetic' column if it exists
    if 'Diabetic' in df.columns:
        df['Diabetic'] = pd.to_numeric(df['Diabetic'], errors='coerce').fillna(0).astype(int)

    X = df.drop('target', axis=1)
    y = df['target']
    
    # Identify object columns and one-hot encode them
    object_cols = X.select_dtypes(include=['object']).columns
    X = pd.get_dummies(X, columns=object_cols, dummy_na=True)
    
    # Drop columns that are completely empty
    X.dropna(axis=1, how='all', inplace=True)
    
    # Align columns - crucial for concatenated dataframes
    X = X.apply(pd.to_numeric, errors='coerce')
    
    # Use SimpleImputer to handle NaN values
    imputer = SimpleImputer(strategy='mean')
    X_imputed = imputer.fit_transform(X)
    
    # Create a new dataframe with imputed values and original column names
    X = pd.DataFrame(X_imputed, columns=X.columns)

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize and train the model
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    # Make predictions and evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy}")

    # Save the trained model
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    joblib.dump(model, MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    train_model()
