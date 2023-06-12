import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MainScreen.css";
import L from "leaflet";
import markerPng from "../assets/marker.png";
const API_KEY = "631f95c85007abdc223b5503b8f9d0e3";

export default function LeafyMap() {
  const [forecast, setForecast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [mapCenter, setMapCenter] = useState([31.7683, 35.2137]);
  const [distanceMarkerVisible, setDistanceMarkerVisible] = useState(false);
  const defualtButtonName = "Calculate distance between two markers";
  const [distanceButtonName, setDistanceButtonName] =
    useState(defualtButtonName);
  function solveDistance() {
    if (marker1 && marker2) {
      const latLng1 = marker1.getLatLng();
      const latLng2 = marker2.getLatLng();
      let calculatedDistance = latLng1.distanceTo(latLng2); // Convert to kilometers
      calculatedDistance = calculatedDistance / 1000;
      console.log(typeof calculatedDistance);
      setDistance(calculatedDistance.toFixed(3));
    } else {
      setDistance(0);
    }
  }
  const handleMarker1DragEnd = (event) => {
    const marker = event.target;
    setMarker1(marker);
    solveDistance();
  };
  const handleMarker2DragEnd = (event) => {
    const marker = event.target;
    setMarker2(marker);
    solveDistance();
  };
  const [distance, setDistance] = useState(0);
  const [marker1, setMarker1] = useState(null);
  const [marker2, setMarker2] = useState(null);
  const marker1Ref = useRef();
  const marker2Ref = useRef();
  async function fetchWeatherForecast() {
    try {
      console.log(searchResult.lat, searchResult.lng);
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${searchResult.lat}&lon=${searchResult.lng}&exclude=current&appid=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log("data", data);
      setForecast(data);
    } catch (error) {
      console.log("Error occurred while fetching weather forecast:", error);
    }
  }
  useEffect(() => {
    solveDistance();
  }, [marker1, marker2, searchResult]);
  const handleMarkerClick = (event) => {
    const { lat, lng } = event.latlng;
    const newMarker = L.marker([lat, lng], { draggable: true });
    if (!marker1) {
      setMarker1(newMarker);
    } else if (!marker2) {
      setMarker2(newMarker);
    }
  };
  const MapClickHandler = () => {
    useMapEvents({
      click: distanceMarkerVisible ? handleMarkerClick : null,
    });
    return null;
  };
  function ChangeView({ center }) {
    const map = useMapEvents({
      moveend: () => {
        const newCenter = map.getCenter();
        console.log([newCenter.lat, newCenter.lng]);
        setMapCenter([newCenter.lat, newCenter.lng]);
      },
    });
    // map.setView(center, map.getZoom());
    return null;
  }
  const handleForecast = async () => {
    fetchWeatherForecast();
  };
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${searchTerm}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setSearchResult({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        setSearchResult(null);
        setForecast(null);
      }
    } catch (error) {
      console.log("Error occurred while searching:", error);
      setSearchResult(null);
      setForecast(null);
    }
  };
  const distanceMarkersButtonClicked = () => {
    // setDistanceMarkerPosition(mapCenter);
    setDistanceMarkerVisible(true);
  };
  const customRedIcon = L.icon({
    iconUrl: markerPng,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
  const customBlueIcon = L.icon({
    iconUrl: markerPng,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });

  customBlueIcon.options.className = "blue-marker-icon"; // Add a class name to apply the filter

  return (
    <div style={{ height: "100%" }}>
      <h1 className="main-container">GeoWeatherMap</h1>
      <div className="head-body">
        <table>
          <th>
            <div className="search-container">
              {searchResult && (
                <button className="search-button" onClick={handleForecast}>
                  Get weather forecast
                </button>
              )}
              {/* {!forecast && <div>Loading weather forecast...</div>} */}

              {forecast && (
                <div>
                  <h2 className="distance-container">Weather Forecast</h2>
                  {/* Access and display the weather data as needed */}
                  {/* For example: */}
                  <p>
                    Temperature: {(forecast.main.temp - 273.15).toFixed(2)}°C
                  </p>
                  <p>Humidity: {forecast.main.humidity}%</p>
                  <p>Wind Speed: {forecast.wind.speed} m/s</p>
                  {/* ... */}
                </div>
              )}

              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) => {
                  console.log(event.target.value);
                  setSearchTerm(event.target.value);
                }}
                className="search-input"
              />
              <button className="search-button" onClick={handleSearch}>
                Search
              </button>
            </div>
          </th>
          <th>
            <div>
              <button
                className="search-button"
                onClick={() => {
                  distanceMarkersButtonClicked();
                  setDistanceButtonName("Click on map to create markers");
                }}
              >
                {distanceButtonName}
              </button>
              <div></div>
              <text className="search-note">you can drag markers</text>
            </div>
          </th>
          <th>
            {distance !== 0 && (
              <h2 className="distance-container">
                Distance: {distance} kilometers.
              </h2>
            )}
          </th>
          <th>
            <button
              className="clear-button"
              onClick={() => {
                setMarker1(null);
                setMarker2(null);
                setSearchResult(null);
                setForecast(null);
                setDistanceMarkerVisible(false);
                setSearchTerm("");
              }}
            >
              Clear
            </button>
          </th>
        </table>
      </div>
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "740px", width: "100%" }}
          // onClick={handleMarkerClick}
        >
          <MapClickHandler />

          <ChangeView center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {searchResult && (
            <Marker
              position={[searchResult.lat, searchResult.lng]}
              icon={customRedIcon}
            ></Marker>
          )}
          {marker1 && (
            <Marker
              ref={marker1Ref}
              position={marker1.getLatLng()}
              draggable={true}
              icon={customBlueIcon}
              eventHandlers={{
                dragend: handleMarker1DragEnd,
              }}
            />
          )}
          {marker2 && (
            <Marker
              ref={marker2Ref}
              position={marker2.getLatLng()}
              draggable={true}
              icon={customBlueIcon}
              eventHandlers={{
                dragend: handleMarker2DragEnd,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
