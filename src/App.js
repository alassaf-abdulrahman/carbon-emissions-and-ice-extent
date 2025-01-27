import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import './App.css';

function App() {

  const [countryCarbonData, setCountryCarbonData] = useState(null);
  const [regionCarbonData, setRegionCarbonData] = useState(null);
  const [northiceExtentData, setNorthiceExtentData] = useState(null);
  const [southiceExtentData, setSouthiceExtentData] = useState(null);

  useEffect(() => {
    d3.csv("../public/datasets/set1/country_dimension.csv").then((data) => {
      setCountryCarbonData(data);
    });
    d3.csv("../public/datasets/set1/region_dimension.csv").then((data) => {
      setRegionCarbonData(data);
    });
    d3.csv("../public/datasets/set2/north_sea_ice_extent.csv").then((data) => {
      setNorthiceExtentData(data);
    });
    d3.csv("../public/datasets/set2/south_sea_ice_extent.csv").then((data) => {
      setSouthiceExtentData(data);
    });
  }, []);

  return (
    <div className="App">

    </div>
  );
}

export default App;
