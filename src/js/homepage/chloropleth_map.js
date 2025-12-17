// Mapbox config information + Colour Scale

// Load Mapbox token from config file
mapboxgl.accessToken = window.CONFIG.MAPBOX_TOKEN;
let hoveredStateId = null;
let mapView = "mercator_projection"; // default

let mapBox = null;
let mapContainer = "map_backup";
let notMap = "map";

function setEventHandlers() {
  // Set Animation Event handlers

  setAnimationBackBtn();
  setAnimationButton();
  setAnimationForwardButton();
  setMapViewSelector();
}

function visualiseChloroplethMap(
  filtered_happiness_data,
  filtered_world_bank_data
) {
  // Group datasets by target year
  target_year = MIN_YEAR; // start year - default to 2005
  happiness_data_by_year = d3.group(filtered_happiness_data, (d) => d["year"]);
  world_bank_data_by_year = d3.group(
    filtered_world_bank_data,
    (d) => d["year"]
  );

  // Show map with filtered data for target year
  target_year_date = new Date(target_year.toString());
  createVisualisation(
    happiness_data_by_year.get(target_year_date),
    world_bank_data_by_year.get(target_year_date),
    colour_scale
  );

  // Set target year text - default
  d3.select("#current_year").text(target_year);

  setEventHandlers();
}

// Function for creating the map visualisation
function createVisualisation(
  happiness_data_current_year,
  world_bank_data_current_year,
  colour_scale
) {
  // Create New Map

  // Switch containers to draw in hidden one
  mapContainer = notMap;
  notMap = notMap == "map_backup" ? "map" : "map_backup";

  mapBox = new mapboxgl.Map({
    container: mapContainer,
    style:
      mapView == "mercator_projection"
        ? "mapbox://styles/mapbox/navigation-night-v1"
        : "mapbox://styles/mapbox/dark-v11", // https://docs.mapbox.com/api/maps/styles/
    center: mapBox == null ? [0, 0] : mapBox.getCenter(),
    zoom: mapBox == null ? 1 : mapBox.getZoom(),
  });

  // Add geoencoder to allow user to search for a country
  mapBox.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    })
  );

  // Create pop up for when hovering over a country
  const popup = new mapboxgl.Popup({
    closeButton: false,
  });

  // Organise data by year and then country
  let world_bank_data_current_year_country = d3.group(
    world_bank_data_current_year,
    (d) => d["country_name"]
  );
  let world_bank_data_current_year_country_code = d3.group(
    world_bank_data_current_year,
    (d) => d["code"]
  );
  let happiness_data_current_year_country = d3.group(
    happiness_data_current_year,
    (d) => d["country_name"]
  );

  mapBox.on("load", () => {
    // Add map borders data source
    mapBox.addSource("country_borders", {
      type: "vector",
      url: "mapbox://mapbox.country-boundaries-v1",
    });

    // For each country in datasets apply calculated colour scale

    happiness_data_current_year.forEach((country_record_happy) => {
      // Extract corresponding data record from word bank dataset
      let d_w_b = world_bank_data_current_year_country.get(
        country_record_happy["country_name"]
      )[0];

      // Add mapbox layer
      let layer_id = country_record_happy["country_name"];
      let fill_colour = colour_scale(
        d_w_b["government_effectiveness"] - country_record_happy["life_ladder"]
      );

      mapBox.addLayer(
        // https://www.nieknijland.nl/blog/how-to-highlight-countries-with-mapbox
        {
          id: layer_id,
          source: "country_borders",
          "source-layer": "country_boundaries",
          type: "fill",
          paint: {
            "fill-color": `${fill_colour}`,
            "fill-opacity": [
              // controls hover effect
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.7,
            ],
          },
        },
        "country-label"
      );

      // Highlight Specific Country
      mapBox.setFilter(layer_id, ["in", "iso_3166_1_alpha_3", d_w_b["code"]]);

      //////////////////// Code adapted from https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/

      // Change colour opacity when hovering on a country
      mapBox.on("mousemove", layer_id, (e) => {
        // Update cursor pointer - select icon
        mapBox.getCanvas().style.cursor = "pointer";

        if (e.features.length > 0) {
          // Display pop up

          // Extracting dataset information for country
          let selected_country_code =
            e.features[0].properties.iso_3166_1_alpha_3;
          let w_b_country_details =
            world_bank_data_current_year_country_code.get(
              selected_country_code
            )[0]; // use code to extract country name
          let selected_country_name = w_b_country_details["country_name"];
          let h_country_details = happiness_data_current_year_country.get(
            selected_country_name
          )[0];

          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `
                                    <b>Country Name</b> : ${selected_country_name}<br>
                                    <b>Est Gov Effectiveness</b> : ${roundTo2Dp(
                                      w_b_country_details[
                                        "government_effectiveness"
                                      ]
                                    )}<br>
                                    <b>Life Ladder</b>: ${roundTo2Dp(
                                      h_country_details["life_ladder"]
                                    )}<br>
                                    <b>Correlation</b> : ${roundTo2Dp(
                                      w_b_country_details[
                                        "government_effectiveness"
                                      ] - h_country_details["life_ladder"]
                                    )}<br>
                                `
            )
            .addTo(mapBox);

          // Change opaqueness
          if (hoveredStateId !== null) {
            mapBox.setFeatureState(
              {
                source: "country_borders",
                sourceLayer: "country_boundaries",
                id: hoveredStateId,
              },
              { hover: false }
            );
          }

          hoveredStateId = e.features[0].id;
          mapBox.setFeatureState(
            {
              source: "country_borders",
              sourceLayer: "country_boundaries",
              id: hoveredStateId,
            },
            { hover: true }
          );
        }
      });

      // Change colour opacity back to normal (0.4) when mouse leaves country borders
      mapBox.on("mouseleave", layer_id, () => {
        // Hide pop up
        popup.remove();

        // Update cursor pointer - back to grabbing
        mapBox.getCanvas().style.cursor = "";

        // Change opaqueness
        if (hoveredStateId !== null) {
          mapBox.setFeatureState(
            {
              source: "country_borders",
              sourceLayer: "country_boundaries",
              id: hoveredStateId,
            },
            { hover: false }
          );
        }

        hoveredStateId = null;
      });

      /////////////////////////////////////////

      // Allow user to select a country which moves into individualCountry.html

      // Change colour opacity back to normal (0.4) when mouse leaves country borders
      mapBox.on("click", layer_id, (e) => {
        if (e.features.length > 0) {
          // Extracting country_name as used in dataset via mapbox country_code
          let selected_country_code =
            e.features[0].properties.iso_3166_1_alpha_3;
          let w_b_country_details =
            world_bank_data_current_year_country_code.get(
              selected_country_code
            )[0]; // use code to extract country name

          // Send in URL to individualCountry.html
          window.location.href = `individualCountry.html?country=${w_b_country_details["country_name"]}&country_code=${e.features[0].properties.iso_3166_1}`;
        }
      });
    });
  });

  // Fade in MapBox using MapContainer
  d3.select(`#${notMap}`)
    .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .style("opacity", 0)
    .on("end", () => {
      // Callback method to clear the map object
      d3.select(`#${notMap}`).html(null);

      if (!animation_started) {
        // Re-enable Buttons
        d3.selectAll(".animation_btns").attr("disabled", null);
      }
    });
  d3.select(`#${mapContainer}`)
    .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .style("opacity", 1);

  // Change Z-index to allow user to interact with map
  d3.select(`#${mapContainer}`).style("z-index", 2); // put on top
  d3.select(`#${notMap}`).style("z-index", 0); // put on bottom
}
