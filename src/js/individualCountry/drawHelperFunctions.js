function attributeColourMap(label) {
    if (label === "Control of Corruption") {
        return "#00441b";
    } else if (label === "Regulator Quality") {
        return "#41ae76";
    } else if (label === "Government Effectiveness") {
        return "#4d004b";
    } else if (label === "Rule Of Law") {
        return "#8c6bb1";
    } else if (label === "Voice and Accountability") {
        return "#084081";
    } else if (label === "Political Stability") {
        return "#4eb3d3";
    // Personal factor colours
    } else if (label === "Life Ladder") {
        return "#7f0000";
    } else if (label === "Log GDP per capita") {
        return "#ef6548";
    } else if (label === "Healthy life expectancy at birth") {
        return "#8d8800";
    } else if (label === "Freedom to make life choices") {
        return "#eee700";
    } else {
        return "black";
    }
}


function drawGraph() {
    let svg = d3.select('#comparison_graph')
    const element_width = d3.select("#graph_div").style("width");

    const element_size = small_x * 20;
    const graph_width = element_width;
    // We want to have a large graph, but also keep most of the selectors in view
    const graph_height = small_y * 70;
    const graph_margin_x = small_x * 3;
    const graph_margin_y = small_x * 3;
    let scatterplot_SVG = d3.select("#comparison_graph")
    scatterplot_SVG
        .style("background-color", "white")
        .attr("width", graph_width)
        .attr("height", graph_height)
    // Delete old graph points
    scatterplot_SVG.selectAll("circle").remove()
    // Remove axes
    scatterplot_SVG.selectAll("g").remove()
    // Remove lines
    scatterplot_SVG.selectAll("path").remove()

    if (selected_soc_circle.size + selected_per_circle.size < 1) {
        d3.select("#graph_div").style("display", "none");
        d3.select("#graph_title").text("No factors selected");
    } else {
        d3.select("#graph_div").style("display", "flex");
        d3.select("#graph_title").text("Graph of selected Societal and Personal factors over time, normalised between 0 and 1");
    }
    const svg_width = d3.select("#comparison_graph").node().getBoundingClientRect().width;

    let x_scale = d3.scaleLinear()
        .range([graph_margin_x, svg_width - graph_margin_x
        ])
        .domain([2005, 2021])

    let y_scale = d3.scaleLinear()
        .range([graph_height - graph_margin_y, graph_margin_y])
        .domain([0, 1])

    let graph_points = [];

    let x_axis = d3.axisBottom(x_scale).tickFormat(d3.format("d"));
    let y_axis = d3.axisLeft(y_scale);
    for (let arr = selected_soc_circle.values(), label = null; label = arr.next().value; ) {
        for (const record in country_wb_data) {
            graph_points.push({"year" : country_wb_data[record].year.getFullYear(), "value" : mapWBLabelToAttr(label, country_wb_data[record]), "name" : label})
        }
    }
    for (let arr = selected_per_circle.values(), label = null; label = arr.next().value; ) {
        for (const record in country_h_data) {
            graph_points.push({"year" : country_h_data[record].year.getFullYear(), "value" : mapHLabelToAttr(label, country_h_data[record]), "name" : label})
        }
    }

    // Add the axes
    scatterplot_SVG
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${graph_height - graph_margin_y})`)
        .call(x_axis);

    scatterplot_SVG
        .append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${graph_margin_x},0)`)
        .call(y_axis);

    // Add axis titles
    scatterplot_SVG.select(".x.axis")
    .style("font-size", "0.7vw")
        .append("text")
            .text("Year")
            .style("fill", "black")
            .style("font-size", "1vw")
            .attr("x", (svg_width - graph_margin_x * 2) / 2)
            .attr("y", (graph_margin_y) * 2/3 );

    // Add axis titles
    scatterplot_SVG.select(".y.axis")
    .style("font-size", "0.7vw")
        .append("text")
            .text("Normalised values")
            .style("fill", "black")
            .style("font-size", "1vw")
            .attr("y", (-graph_margin_x) *2/3)
            .attr("x", (-graph_height + graph_margin_y * 2)/2)
            .attr("transform", `rotate(-90)`);
    
    const grouped_graph_data = d3.group(graph_points, d => d.name);

    const lineGenerator = d3.line()
                .x((d) => x_scale(parseInt(d.year)))
                .y((d) => y_scale(d.value))

    for (let arr = selected_per_circle.values(), label = null; label = arr.next().value; ) {
        const selected_data = grouped_graph_data.get(label);
        scatterplot_SVG.append("path")
            .datum(selected_data)
            .attr("class", "line " + label)
            .style("stroke", attributeColourMap(label))
            .style("stroke-dasharray", ("3, 3"))
            .attr("d", lineGenerator);
    }

    for (let arr = selected_soc_circle.values(), label = null; label = arr.next().value; ) {
        const selected_data = grouped_graph_data.get(label);
        scatterplot_SVG.append("path")
            .datum(selected_data)
            .attr("class", "line " + label)
            .style("stroke", attributeColourMap(label))
            .attr("d", lineGenerator);
    }

    scatterplot_SVG.selectAll("circle")
        .data(graph_points)
        .enter()
        .append("circle")
            .style("fill", (d) => attributeColourMap(d.name))
            .style("stroke", (d) => attributeColourMap(d.name))
            .style("opacity", "0.5")
            .attr("cx", (d) => x_scale(parseInt(d.year)))
            // Assume all values have been normalised before this point
            .attr("cy", (d) => y_scale(d.value))
            .attr("r", 5)
            .on("mouseover", (e, d) => {
                // We don't want to show tooltips for the parent circle because the information is meaningless
                if (d.name != "societal_factors" && d.name != "personal_factors") {
                    return tooltip.style("visibility", "visible").style("left", (e.x + 10) + "px")
                        .style("top", (e.y - 10) + "px").style("font-size", element_size/25 + "px")
                        .text(d.name + " : " + "(" + roundTo2Dp(d.value) + " / 1)")
                };})
            .on("mousemove", function(e){return tooltip.style("left", (e.x + 10) + "px").style("top", (e.y - 10) + "px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
}



// Create a selectable circular treemap from the given hierachical dataset
function drawCircularTreemap(data, svg_id, element_size) {
    let root = d3.hierarchy(data)
        .sort((a, b) => a.value - b.value);
    
    root.sum(function(d) {
        return d.value;
    })

    // Adapting circular packing code example from https://www.d3indepth.com/hierarchies/
    d3.pack().size([element_size, element_size])(root);
    
    // Adapting circular packing code example from https://www.d3indepth.com/hierarchies/
    var nodes = d3.select(svg_id)
        .append('g')
        .selectAll("circle")
        .data(root.descendants())
        .enter()

    nodes.append('circle')
        .classed('node', true)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .style("fill", function(d) {
            if (selected_per_circle.has(d.data.name) || selected_soc_circle.has(d.data.name)) {
                return attributeColourMap(d.data.name);
            } else {
                return "white";
            }
        })
        .on("mouseover", (e, d) => {
            // We don't want to show tooltips for the parent circle because the information is meaningless
            if (d.data.name != "societal_factors" && d.data.name != "personal_factors") {
                return tooltip.style("visibility", "visible").style("left", (e.x + 10) + "px")
                    .style("top", (e.y - 10) + "px").style("font-size", element_size/25 + "px")
                    .text(d.data.name + " : " + "(" + roundTo2Dp(d.data.value) + " / 1)")
            };})
        .on("mousemove", function(e){return tooltip.style("left", (e.x + 10) + "px").style("top", (e.y - 10) + "px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
        .on("click", function(e, d) {
            if (d.data.name != "societal_factors" && d.data.name != "personal_factors") {
                if (d.data.contributes_to == "societal_factors") {
                    if (selected_soc_circle.has(d.data.name)) {
                        selected_soc_circle.delete(d.data.name);
                    } else {
                        selected_soc_circle.add(d.data.name);
                    }
                } else {
                    if (selected_per_circle.has(d.data.name)) {
                        selected_per_circle.delete(d.data.name);
                    } else {
                        selected_per_circle.add(d.data.name);
                    }
                }
                d3.select(this).style("fill", function(d) {
                    if (selected_per_circle.has(d.data.name) || selected_soc_circle.has(d.data.name)) {
                        return attributeColourMap(d.data.name);
                    } else {
                        return "white";
                    }
                })
                drawGraph();
            }	
        });

    nodes.append("text")
        .attr('dx', d => d.x)
        .attr('dy', d => d.y)
        .attr('inline-size', "1px")
        .style("overflow", "hidden")
        .style("text-anchor", "middle")
        .style("font-size", element_size/25 + "px")
        .style("fill", (d) => attributeColourMap(d.name))
        .text(function(d) {
            return d.children === undefined ? d.data.name.slice(0, 10) + "..." : '';
        })
}


// Draw circular treemap for societal factors
function drawSocTreemap(small_x, current_wb_data) {
    const element_size = small_x * 20;
    const svg_width = d3.select("#societal_factor_selector").node().getBoundingClientRect().width;
    const left_offset = (svg_width - element_size)/2;
    d3.select("#societal_factor_selector")
        .attr("height", element_size + small_x)
        .attr("width", element_size)
        .style("position", "relative")
        .style("left", left_offset + "px")
    const data = {"children" : [], "value" : 0, "name" : "societal_factors", "contributes_to" : "societal_factors"};
    for (const [key, value] of Object.entries(current_wb_data)) {
        const full_key = mapWBKeys(key);
        if (full_key != null) {
            data.children.push({ "name": full_key, "value" : value, "contributes_to" : "societal_factors"});
            data.value = data.value + value;
            // console.log(`${full_key}: ${mapWBValues(value)}`);
        }
    }
    d3.select("#societal_factor_selector").selectAll("g").remove();
    drawCircularTreemap(data, "#societal_factor_selector", element_size);
}


// Draw circular treemap for personal factors
function drawPerTreemap(small_x, current_h_data) {
    const element_size = small_x * 20;
    const svg_width = d3.select("#personal_factor_selector").node().getBoundingClientRect().width;
    const left_offset = (svg_width - element_size)/2;
    d3.select("#personal_factor_selector")
        .attr("height", element_size)
        .attr("width", element_size)
        .style("position", "relative")
        .style("left", left_offset + "px")
    const data = {"children" : [], "value" : 0, "name" : "personal_factors", "contributes_to" : "personal_factors"};
    for (const [key, value] of Object.entries(current_h_data)) {
        // Make sure to avoid including country name or year
        if (mapHKeys(key) != null) {
            data.children.push({ "name": mapHKeys(key), "value" : value, "contributes_to" : "personal_factors"});
            data.value = data.value + value;
        }
    }
    d3.select("#personal_factor_selector").selectAll("g").remove();
    drawCircularTreemap(data, "#personal_factor_selector", element_size);
}