import React from 'react';
import '../components/result.css'
import {useReducer} from 'react';
import AppState from '../services/mobxState.tsx';

type CounterAction =
  | { type: "reset" }
  | { type: "setCount"; value: State["count"] }

interface State {
  travelPlan: tralvelPlan
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

interface tralvelPlan {
  month: string
  temperature: number
  precipitation: number
  city: string
  country: string
  activities: Array<Activity>
  meals: Array<Meals>
}

const initialTravelPlan: tralvelPlan = {
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
  const [state, dispatch] = useReducer(stateReducer, initialState);

  const addFive = () => dispatch({ type: "setCount", value: state.count + 5 });
  const reset = () => dispatch({ type: "reset" });

  return (
    <div>
      <div className='backResult'>
        <p className='city'>{AppState.activities?.travel_plan?.destination} {state.travelPlan.city}</p>
        <p className='country'> {AppState.activities?.travel_plan?.country} {state.travelPlan.country}</p>
        <div className='activity_div'>
          <p className='activity_header_title'>ACTIVITIES</p>
          <div className='activity_body'>
            <p className='activity_header_day'>DIA 1</p>
            <div className='activity_infos' >
              {state.travelPlan.activities.map((info, i) => (
                <div className='div_infos_group'>
                  <div className='activity_infos_name_price' key={i}>
                    <p className='activity_name'> {info.activity} </p>
                    <p className='activity_price'>{info.price} USD</p>
                  </div>
                  <p className='activity_site'> {info.site} </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='meals_div'>
          <p className='meals_header_title'>MEALS</p>
          <div className='meals_body'>
          
          <div className='meals_infos' >
            {state.travelPlan.meals.map((info, i) => (
              <div className='div_infos_group'>
                <div className='meals_infos_name_price' key={i}>
                  <p className='meals_name'> {info.meals} </p>
                  <p className='meals_price'>{info.price} USD</p>
                </div>
                <p className='meals_site'> {info.site} </p>
              </div>
            ))}
            
            </div>
            <p className='meals_header_day'>DIA 1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

