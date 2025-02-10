import pandas as pd

# Load the CSV file
data_path = 'Carbon_(CO2)_Emissions_by_Country.csv'  # Replace with your file path
data = pd.read_csv(data_path)

# Ensure the 'Date' column is in datetime format
data['Date'] = pd.to_datetime(data['Date'])

# Extract the Year from the Date column
data['Year'] = data['Date'].dt.year

# Drop the Date column as it's no longer needed
data = data.drop(columns=['Date'])

# Sort data by Country alphabetically and then by Year
data_sorted = data.sort_values(by=['Country', 'Year']).reset_index(drop=True)

# Save the sorted data to a new CSV file
output_path = 'sorted_carbon_emissions.csv'  # Replace with your desired output path
data_sorted.to_csv(output_path, index=False)

# Create a country-specific CSV file
country_data = data_sorted[['Country', 'Year', 'Kilotons of Co2', 'Metric Tons Per Capita']]
country_output_path = 'country_dimension.csv'
country_data.to_csv(country_output_path, index=False)

# Create a region-specific CSV file
region_data = data_sorted.groupby(['Region', 'Year'], as_index=False).sum()
region_data = region_data.drop(columns=['Country'])
region_output_path = 'region_dimension.csv'
region_data.to_csv(region_output_path, index=False)

print(f"Country data saved to {country_output_path}")
print(f"Region data saved to {region_output_path}")
