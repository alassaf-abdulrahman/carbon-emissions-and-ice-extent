import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./App.css";

function App() {
  const [countryCarbonData, setCountryCarbonData] = useState(null);
  const [regionCarbonData, setRegionCarbonData] = useState(null);
  const [northIceExtentData, setNorthIceExtentData] = useState(null);
  const [southIceExtentData, setSouthIceExtentData] = useState(null);

  const [selectedYear, setSelectedYear] = useState(1990);
  const [viewBy, setViewBy] = useState("Country"); // "Country" or "Region"
  const [metric, setMetric] = useState("Kilotons of Co2"); // "Kilotons of Co2" or "Metric Tons Per Capita"

  useEffect(() => {
    d3.csv("/datasets/set1/country_dimension.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year;
        d["Kilotons of Co2"] = +d["Kilotons of Co2"];
      });
      setCountryCarbonData(data);
    });

    d3.csv("/datasets/set1/region_dimension.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year;
        d["Kilotons of Co2"] = +d["Kilotons of Co2"];
      });
      setRegionCarbonData(data);
    });

    d3.csv("/datasets/set2/north_sea_ice_extent.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year;
        d["Extent 10^6 sq km"] = +d["Extent 10^6 sq km"];
      });
      setNorthIceExtentData(data);
    });

    d3.csv("/datasets/set2/south_sea_ice_extent.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year;
        d["Extent 10^6 sq km"] = +d["Extent 10^6 sq km"];
      });
      setSouthIceExtentData(data);
    });
  }, []);

  useEffect(() => {
    if (northIceExtentData && southIceExtentData) {
      const drawIceExtentChart = () => {
        const svgWidth = 800;
        const svgHeight = 400;
        const margin = { top: 20, right: 30, bottom: 50, left: 50 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        d3.select("#ice-extent-chart").select("svg").remove();

        const svg = d3
          .select("#ice-extent-chart")
          .append("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight);

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3
          .scaleLinear()
          .domain(
            d3.extent(northIceExtentData, (d) => +d.Year).map((d) => +d)
          )
          .range([0, width]);

        const y = d3
          .scaleLinear()
          .domain([
            0,
            d3.max([
              ...northIceExtentData.map((d) => +d["Extent 10^6 sq km"]),
              ...southIceExtentData.map((d) => +d["Extent 10^6 sq km"]),
            ]),
          ])
          .range([height, 0]);

        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(y);

        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis)
          .append("text")
          .attr("x", width / 2)
          .attr("y", 40)
          .text("Year")
          .attr("fill", "black");

        g.append("g").call(yAxis).append("text").text("Extent (10^6 sq km)");

        const lineGenerator = d3
          .line()
          .x((d) => x(+d.Year))
          .y((d) => y(+d["Extent 10^6 sq km"]));

        g.append("path")
          .datum(northIceExtentData)
          .attr("fill", "none")
          .attr("stroke", "blue")
          .attr("stroke-width", 2)
          .attr("d", lineGenerator);

        g.append("path")
          .datum(southIceExtentData)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("d", lineGenerator);

        g.append("text")
          .attr("x", width - 100)
          .attr("y", 20)
          .attr("fill", "blue")
          .text("North Ice Extent");

        g.append("text")
          .attr("x", width - 100)
          .attr("y", 40)
          .attr("fill", "red")
          .text("South Ice Extent");
      };
      drawIceExtentChart();
    }
  }, [northIceExtentData, southIceExtentData]);

  useEffect(() => {
    if (selectedYear && countryCarbonData && regionCarbonData) {
      const drawBarChart = () => {
        const data =
          viewBy === "Country"
            ? countryCarbonData.filter((d) => +d.Year === +selectedYear)
            : regionCarbonData.filter((d) => +d.Year === +selectedYear);

        console.log("Filtered Data:", data);

        const sortedData = data
          .sort((a, b) => +b[metric] - +a[metric])
          .slice(0, 10);

        console.log("Sorted Data:", sortedData);

        const svgWidth = 800;
        const svgHeight = 400;
        const margin = { top: 20, right: 30, bottom: 50, left: 100 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        d3.select("#carbon-bar-chart").select("svg").remove();

        const svg = d3
          .select("#carbon-bar-chart")
          .append("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight);

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3
          .scaleLinear()
          .domain([0, d3.max(sortedData, (d) => +d[metric])])
          .range([0, width]);

        const y = d3
          .scaleBand()
          .domain(sortedData.map((d) => (viewBy === "Country" ? d.Country : d.Region)))
          .range([0, height])
          .padding(0.1);

        g.append("g").call(d3.axisLeft(y));
        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));

        g.selectAll("rect")
          .data(sortedData)
          .enter()
          .append("rect")
          .attr("y", (d) => y(viewBy === "Country" ? d.Country : d.Region))
          .attr("width", (d) => x(+d[metric]))
          .attr("height", y.bandwidth())
          .attr("fill", "steelblue");
      };
      drawBarChart();
    }
  }, [selectedYear, viewBy, metric, countryCarbonData, regionCarbonData]);

  return (
    <div className="App">
      <div id="ice-extent-chart"></div>

      <div>
        <label>
          Select Year:
          <select
            onChange={(e) => setSelectedYear(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Choose Year
            </option>
            {countryCarbonData &&
              [...new Set(countryCarbonData.map((d) => d.Year))].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
        </label>
        <label>
          View By:
          <select onChange={(e) => setViewBy(e.target.value)} defaultValue="Country">
            <option value="Country">Country</option>
            <option value="Region">Region</option>
          </select>
        </label>
        <label>
          Metric:
          <select onChange={(e) => setMetric(e.target.value)} defaultValue="Kilotons of Co2">
            <option value="Kilotons of Co2">Kilotons of Co2</option>
            <option value="Metric Tons Per Capita">Metric Tons Per Capita</option>
          </select>
        </label>
      </div>

      <div id="carbon-bar-chart"></div>
    </div>
  );
}

export default App;
