import React from 'react';
import '../components/result.css'
import {useReducer} from 'react';

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

interface activity {
  name: string
  price: number
  site: string
}

interface tralvelPlan {
  month: string
  temperature: number
  precipitation: number
  city: string
  country: string
  activitites: Array<activity>
  meals: Array<activity>
}

const initialTravelPlan: tralvelPlan = {
  month: 'april',
  temperature: 30,
  precipitation: 20,
  city: 'BANGKOK',
  country: 'thailand',
  activitites: [
    {
      name: 'Experience the nightlife at Khao San Road, xperience the nightlife at Khao San Road, xperience the nightlife at Khao San Road, xperience the nightlife at Khao San Road',
      price: 1000,
      site: 'grandpalac.com.br'
    },
    {
      name: 'sushi',
      price: 200,
      site: 'sushibar.com.br'
    },
    {
      name: 'sightseeing',
      price: 100,
      site: 'grandpalac.com.br'
    },
    {
      name: 'sushi',
      price: 200,
      site: 'sushibar.com.br'
    }
  ],
  meals: [
    {
      name: 'breakfast',
      price: 10,
      site: 'breakfast.com.br'
    },
    {
      name: 'lunch',
      price: 20,
      site: 'lunch.com.br'
    }
  ]
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
      <p className='city'>{state.travelPlan.city} </p>
      <p className='country'> {state.travelPlan.country}</p>

      <div className='activity_div'>
        <p className='activity_header_title'>ACTIVITIES</p>
        <div className='activity_body'>
          <p className='activity_header_day'>DIA 1</p>
          <div className='activity_infos' >
            {state.travelPlan.activitites.map((activity, i) => (
              <div className='div_infos_group'>
                <div className='activity_infos_name_price' key={i}>
                  <p className='activity_name'> {activity.name} </p>
                  <p className='activity_price'>{activity.price} USD</p>
                </div>
                <p className='activity_site'> {activity.site} </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='meals_div'>
        <p className='meals_header_title'>MEALS</p>
        <div className='meals_body'>
        
        <div className='meals_infos' >
          {state.travelPlan.meals.map((activity, i) => (
            <div className='div_infos_group'>
              <div className='meals_infos_name_price' key={i}>
                <p className='meals_name'> {activity.name} </p>
                <p className='meals_price'>{activity.price} USD</p>
              </div>
              <p className='meals_site'> {activity.site} </p>
            </div>
          ))}
          
          </div>
          <p className='meals_header_day'>DIA 1</p>
        </div>
    </div>
    </div>

  );
};

