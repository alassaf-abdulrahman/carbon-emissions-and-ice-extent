import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./App.css";

function App() {
  const [countryCarbonData, setCountryCarbonData] = useState(null);
  const [northiceExtentData, setNorthiceExtentData] = useState(null);
  const [southiceExtentData, setSouthiceExtentData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(1990);

  useEffect(() => {
    d3.csv("/datasets/set1/country_dimension.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year;
        d["Kilotons of Co2"] = +d["Kilotons of Co2"];
      });
      setCountryCarbonData(data);
    });

    d3.csv("/datasets/set2/north_sea_ice_extent.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year;
        d["Extent 10^6 sq km"] = +d["Extent 10^6 sq km"];
      });
      setNorthiceExtentData(data);
    });

    d3.csv("/datasets/set2/south_sea_ice_extent.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year;
        d["Extent 10^6 sq km"] = +d["Extent 10^6 sq km"];
      });
      setSouthiceExtentData(data);
    });
  }, []);



  useEffect(() => {
    if (northiceExtentData && southiceExtentData) {
      const drawLineChart = () => {
        const svg = d3.select("#lineChart");
        svg.selectAll("*").remove(); // Clear existing chart

        const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const x = d3
          .scaleLinear()
          .domain(d3.extent(northiceExtentData, (d) => d.Year))
          .range([0, width]);

        const y = d3
          .scaleLinear()
          .domain([
            0,
            d3.max(
              [...northiceExtentData, ...southiceExtentData],
              (d) => d["Extent 10^6 sq km"]
            ),
          ])
          .range([height, 0]);

        const lineNorth = d3
          .line()
          .x((d) => x(d.Year))
          .y((d) => y(d["Extent 10^6 sq km"]));

        const lineSouth = d3
          .line()
          .x((d) => x(d.Year))
          .y((d) => y(d["Extent 10^6 sq km"]));

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));

        g.append("g").call(d3.axisLeft(y));

        g.append("path")
          .datum(northiceExtentData)
          .attr("fill", "none")
          .attr("stroke", "blue")
          .attr("stroke-width", 1.5)
          .attr("d", lineNorth);

        g.append("path")
          .datum(southiceExtentData)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 1.5)
          .attr("d", lineSouth);

        g.append("text")
          .attr("x", width - 100)
          .attr("y", 10)
          .attr("text-anchor", "end")
          .attr("fill", "blue")
          .text("North");

        g.append("text")
          .attr("x", width - 100)
          .attr("y", 30)
          .attr("text-anchor", "end")
          .attr("fill", "red")
          .text("South");
      };
      drawLineChart();
    }
  }, [northiceExtentData, southiceExtentData]);

  useEffect(() => {
    if (countryCarbonData && selectedYear) {
      const drawBarChart = () => {
        const svg = d3.select("#barChart");
        svg.selectAll("*").remove(); // Clear existing chart

        const margin = { top: 20, right: 30, bottom: 50, left: 70 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const filteredData = countryCarbonData
          .filter((d) => d.Year === selectedYear)
          .sort((a, b) => b["Kilotons of Co2"] - a["Kilotons of Co2"])
          .slice(0, 10);

        const x = d3
          .scaleBand()
          .domain(filteredData.map((d) => d.Country))
          .range([0, width])
          .padding(0.2);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(filteredData, (d) => d["Kilotons of Co2"])])
          .range([height, 0]);

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

        g.append("g").call(d3.axisLeft(y));

        g.selectAll(".bar")
          .data(filteredData)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => x(d.Country))
          .attr("y", (d) => y(d["Kilotons of Co2"]))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d["Kilotons of Co2"]))
          .attr("fill", "steelblue");
      };
      drawBarChart();
    }
  }, [countryCarbonData, selectedYear]);

  return (
    <div className="App">
      <h1>Climate Data Visualization</h1>

      <h2>Ice Extent Comparison (North vs. South)</h2>
      <svg id="lineChart" width="800" height="400"></svg>

      <h2>Top 10 Carbon Emitting Countries in {selectedYear}</h2>
      <select onChange={(e) => setSelectedYear(+e.target.value)}>
        <option value="">Select Year</option>
        {countryCarbonData &&
          [...new Set(countryCarbonData.map((d) => d.Year))].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
      </select>
      <svg id="barChart" width="800" height="400"></svg>
    </div>
  );
}

export default App;
