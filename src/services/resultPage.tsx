import React, { useRef }  from 'react';
import '../components/result.css'
import AppState from '../services/mobxState.tsx';
import { Link, useNavigate } from "react-router-dom";
const Plane = require('../plane.png');


type CounterAction =
  | { type: "reset" }
  | { type: "setCount"; value: State["count"] }

interface State {
  travelPlan: TravelPlan
  destination: string
  date: string
  returnDate: string
  count: number
};

interface Activity {
  activity: string
  price: number
  site: string
}

interface Meals {
  meals: string
  price: number
  site: string
}

interface TravelPlan {
  month: string
  temperature: number
  precipitation: number
  city: string
  country: string
  activities: Array<Activity>
  meals: Array<Meals>
}

const initialTravelPlan: TravelPlan = {
  month: AppState.activities?.average_weather?.month,
  temperature: AppState.activities?.average_weather?.temperature,
  precipitation: AppState.activities?.average_weather?.precipitation,
  city: AppState.activities?.travel_plan?.destination,
  country: AppState.activities?.travel_plan?.country,
  activities: AppState.activities?.travel_plan?.activities,
  meals: AppState.activities?.travel_plan?.meals,
}

const initialState: State = {
  count: 0,
  travelPlan: initialTravelPlan,
  destination: '',
  date: "12/12/2021",
  returnDate: "12/12/2021"
};

function stateReducer(state: State, action: CounterAction): State {
  switch (action.type) {
    case "reset":
      return initialState;
    case "setCount":
      return { ...state, count: action.value };
    default:
      throw new Error("Unknown action");
  }
}

export default function ResultPage() {
  const navigate = useNavigate();
  return (
      <div className='backResult'>
        <div className='alert'>
          <p style={{fontWeight: '500'}}>Na versao beta, estamos limitando a quantidade de dias de atividades e refeições em 10 dias.</p>
        </div>
        <p className='city'>{AppState.activities?.travel_plan?.destination}</p>
        <p className='country'>{AppState.activities?.travel_plan?.country}</p>
        <div className='cards_div'>
          {AppState.flights.length > 0 ? (
            <div className='flights_div'>
              <p className='flights_header_title'>Flights</p>
                {AppState.flights?.map((info, i) => (
                <div key={i}>
                  {info.legs.map((leg, i) => (
                    
                    <div className='flights_infos' style={{ borderRadius: i === 0 ? '10px 10px 0 0' : '0'}} key={leg.id}>
                    <div style={{marginBottom: 0}} className='div_infos_group'>
                      <div className='flights_infos_header'>
                        <div className='flights_logo_div_name'>
                          <img src={leg.carriers.marketing[0].logoUrl} alt='logo' className='flights_logo' />
                          <p className='flight_name'>{leg.carriers.marketing[0].name}</p>
                        </div>
                        <p className='flights_number'>{leg?.segments?.operatingCarrier?.alternateId}{leg?.segments?.flightNumber}</p>
                      </div>

                      <div className='cities_flight_names_acronym'>
                        <div className='cities_flight_names_acronym_departure'>
                          <p className='flight_acronym'>{leg.origin.displayCode}</p>
                          <p className='flight_city_gray'>{leg.origin.name}</p>
                          
                        </div>
                        <div className='mid_center_align'>
                          <p className='flight_stops'>{leg.stopCount} stops</p>
                          <img src={Plane} alt='plane_silluette' style={{width: "20px", marginLeft: "15px"}}/>
                        </div>
                        <div className='cities_flight_names_acronym_destination texto-direita'>
                          <p className='flight_acronym'>{leg.destination.displayCode}</p>
                          <p className='flight_city_gray'>{leg.destination.name}</p>
                          
                        </div>
                      </div>
                      <div className='hours_flights_div'>
                      <p className='flight_hour'>{leg.departure.substring(11, leg.departure.length - 3)}</p>
                      <p className='flight_hour'>{leg.arrival.substring(11, leg.departure.length - 3)}</p>
                      </div>
                      <div className='hours_flights_div'>
                      <p className='flight_date'>{leg.departure.substring(8,10)}/{leg.departure.substring(5,7)}/{leg.departure.substring(0,4)}</p>
                      <p className='flight_date'>{leg.arrival.substring(8,10)}/{leg.arrival.substring(5,7)}/{leg.arrival.substring(0,4)}</p>
                      </div>
                    </div>
                  </div>
                  ))}
                  
                  <div className='flights_infos_bottom'>
                    <p className='flights_price'>{info.price.formatted}</p>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                    {info.tags?.includes('cheapest') ? <p className='flights_tags cheapest_tag'>cheapest</p> : null}
                    {info.tags?.includes('shortest') ? <p className='flights_tags fastest_tag'>shortest</p> : null}
                    </div>
                  </div>
                </div>
                ))}
              </div>
          ) : null}
          <div className='activity_div'>
            <p className='activity_header_title'>Activities</p>

            {AppState.activities?.travel_plan?.activities_travel?.map((info, day) => (
              <div className='activity_body' key={day}>
                <p className='activity_header_day'>DAY {day + 1}</p>
                <div className='activity_infos'>
                  {info.activities.map((activity, i) => (
                    <div className='div_infos_group' key={i}>
                      <div className='activity_infos_name_price'>
                        <p className='activity_name'> {activity.activity}</p>
                        <p className='activity_price'>{activity.price} USD</p>
                      </div>
                      <p className='activity_site'> {activity.address} </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>

          <div className='meals_div'>
            <p className='meals_header_title'>Meals</p>
            {AppState.meals?.meals_travel?.map((info, day) => (
              <div className='meals_body' key={day}>
                <div className='meals_infos'>
                  {info.meals.map((meal, i) => (
                    <div className='div_infos_group' key={i}>
                      <div className='meals_infos_name_price'>
                        <p className='meals_name'> {meal.meal} </p>
                        <p className='meals_price'>{meal.price} USD</p>
                      </div>
                      <p className='meals_site'> {meal.address} </p>
                    </div>
                  ))}
                </div>
                <p className='meals_header_day'>DAY {day + 1}</p>
              </div>
            ))}
        </div>
      </div>
      <button style={{ position: 'fixed', bottom: '0', right: '0', margin: '20px', padding: '10px', borderRadius: '10px', backgroundColor: 'white', border: 'none', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)'}} onClick={() => <Link to={"/"} />}>create new planning</button>
    </div>
  );
};

