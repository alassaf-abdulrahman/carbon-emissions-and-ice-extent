import pandas as pd

# Load the CSV file
data_path = 'N_seaice_extent_daily_v3.0.csv'  # Replace with your file path
data = pd.read_csv(data_path)

# Strip any leading or trailing spaces from column names
data.columns = data.columns.str.strip()

# Inspect column names
print("Columns in the dataset:", data.columns)

# Ensure columns match expected names
if 'Year' not in data.columns:
    raise ValueError("The column 'Year' is not found in the dataset. Available columns are:", data.columns)

# Continue with data processing
data['Year'] = data['Year'].astype(int)
data['Month'] = data['Month'].astype(int)
data['Day'] = data['Day'].astype(int)

# Drop unnecessary columns and group by Year
data = data.drop(columns=['index', 'Source Data'], errors='ignore')
grouped_data = data.groupby('Year', as_index=False).agg({
    'Extent 10^6 sq km': 'sum',
    'Missing 10^6 sq km': 'sum'
})

# Save the cleaned data
output_path = 'cleaned_sea_ice_extent.csv'  # Replace with your desired output path
grouped_data.to_csv(output_path, index=False)

print(f"Cleaned data saved to {output_path}")

# N_seaice_extent_daily_v3.0.csv