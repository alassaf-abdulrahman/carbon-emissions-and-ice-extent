import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./App.css";

function App() {
  const [countryCarbonData, setCountryCarbonData] = useState(null);
  const [regionCarbonData, setRegionCarbonData] = useState(null);
  const [northIceExtentData, setNorthIceExtentData] = useState(null);
  const [southIceExtentData, setSouthIceExtentData] = useState(null);
  const [overallIceExtentData, setOverallIceExtentData] = useState(null);


  const [selectedYear, setSelectedYear] = useState(1990);
  const [viewBy, setViewBy] = useState("Country"); // "Country" or "Region"
  const [metric, setMetric] = useState("Kilotons of Co2"); // "Kilotons of Co2" or "Metric Tons Per Capita"
  const [iceExtentView, setIceExtentView] = useState("comparison"); // "comparison" or "overall"

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

    d3.csv("/datasets/set2/overall_sea_ice_extent.csv").then((data) => {
      data.forEach((d) => {
        d.Year = +d.Year; // Convert to number
        d["Extent 10^6 sq km"] = +d["Extent 10^6 sq km"]; // Ensure column name matches CSV
      });
      setOverallIceExtentData(data);
    });
  }, []);

  useEffect(() => {
    const drawIceExtentChart = () => {
      if (!northIceExtentData || !southIceExtentData || !overallIceExtentData) return;
      // Clear previous chart
      d3.select("#ice-extent-chart").select("svg").remove();

      // Chart setup code remains the same until the line drawing...
      const svgWidth = 800;
      const svgHeight = 400;
      const margin = { top: 20, right: 30, bottom: 50, left: 50 };
      const width = svgWidth - margin.left - margin.right;
      const height = svgHeight - margin.top - margin.bottom;

      const svg = d3.select("#ice-extent-chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Update x-axis domain to consider all datasets
      const allYears = [
        ...northIceExtentData.map(d => d.Year),
        ...southIceExtentData.map(d => d.Year),
        ...overallIceExtentData.map(d => d.Year)
      ];

      const x = d3.scaleLinear()
        .domain([d3.min(allYears), d3.max(allYears)])
        .range([0, width]);

      // Update y-axis domain based on view mode
      const y = d3.scaleLinear()
        .domain([
          0,
          iceExtentView === "comparison"
            ? d3.max([
              ...northIceExtentData.map(d => d["Extent 10^6 sq km"]),
              ...southIceExtentData.map(d => d["Extent 10^6 sq km"])
            ])
            : d3.max(overallIceExtentData.map(d => d["Extent 10^6 sq km"]))
        ])
        .range([height, 0]);

      const yAxis = d3.axisLeft(y);
      g.append("g")
        .attr("transform", `translate(20, 0)`)
        .call(yAxis)
        .selectAll(".tick text")
        .style("font-size", "12px")
        .style("fill", "#666");

      // Draw axes (existing code remains the same)

      // Draw lines based on view mode
      const lineGenerator = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d["Extent 10^6 sq km"]));

      if (iceExtentView === "comparison") {
        g.append("path")
          .attr("transform", `translate(20, 0)`)
          .datum(northIceExtentData)
          .attr("fill", "none")
          .attr("stroke", "blue")
          .attr("d", lineGenerator);

        g.append("path")
          .attr("transform", `translate(20, 0)`)
          .datum(southIceExtentData)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("d", lineGenerator);
      } else {
        g.append("path")
          .attr("transform", `translate(20, 0)`)
          .datum(overallIceExtentData)
          .attr("fill", "none")
          .attr("stroke", "green")
          .attr("d", lineGenerator);
      }

      // Update legend based on view mode
      const legend = g.append("g")
        .attr("transform", `translate(${width - 140}, 30)`); // Adjust position as needed

      if (iceExtentView === "comparison") {
        // North legend item
        legend.append("rect")
          .attr("transform", `translate(20, 0)`)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", "blue")
          .attr("y", -40);

        legend.append("text")
          .attr("transform", `translate(20, 0)`)
          .attr("x", 20)
          .attr("y", -30)
          .text("North Ice Extent")
          .style("font-size", "12px");

        // South legend item
        legend.append("rect")
          .attr("transform", `translate(20, 0)`)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", "red")
          .attr("y", -15);

        legend.append("text")
          .attr("transform", `translate(20, 0)`)
          .attr("x", 20)
          .attr("y", -5)
          .text("South Ice Extent")
          .style("font-size", "12px");
      } else {
        // Overall legend item
        legend.append("rect")
          .attr("transform", `translate(20, 0)`)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", "green")
          .attr("y", -40);

        legend.append("text")
          .attr("transform", `translate(20, 0)`)
          .attr("x", 20)
          .attr("y", -30)
          .text("Overall Ice Extent")
          .style("font-size", "12px");
      }

      // X-axis with rotated labels
      const xAxis = d3.axisBottom(x)
        .ticks(15)
        .tickFormat(d3.format("d"));

      g.append("g")
        .attr("transform", `translate(20,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)")
        .style("font-size", "12px")
        .style("fill", "#666");

      g.append("text")
        .attr("transform", `translate(20, 0)`)
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Year");

      // Y-axis label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Extent (10^6 sq km)");
    };

    drawIceExtentChart();
  }, [northIceExtentData, southIceExtentData, overallIceExtentData, iceExtentView]);

  useEffect(() => {
    if (selectedYear && countryCarbonData && regionCarbonData) {
      const drawBarChart = () => {
        const data =
          viewBy === "Country"
            ? countryCarbonData.filter((d) => +d.Year === +selectedYear)
            : regionCarbonData.filter((d) => +d.Year === +selectedYear);

        const sortedData = data
          .sort((a, b) => +b[metric] - +a[metric])
          .slice(0, 10);

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

        g.append("text")
          .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
          .style("text-anchor", "middle")
          .text(metric); // Dynamic label based on selected metric

        // Y-axis label
        g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 15)
          .attr("x", -height / 2)
          .style("text-anchor", "middle")
          .text(viewBy); // "Country" or "Region"
      };
      drawBarChart();
    }
  }, [selectedYear, viewBy, metric, countryCarbonData, regionCarbonData]);

  return (
    <div className="App">
      <div id="ice-extent-chart">
        <div className="chart-controls">
          <label>
            Ice Extent View:
            <select
              value={iceExtentView}
              onChange={(e) => setIceExtentView(e.target.value)}
            >
              <option value="comparison">North/South Comparison</option>
              <option value="overall">Overall Ice Extent</option>
            </select>
          </label>
        </div>
      </div>

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
