
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Subject } from 'rxjs'
import { fromFetch } from 'rxjs/fetch';
import { tap, map, takeUntil, finalize } from 'rxjs/operators';
import { useState, useRef } from 'react';

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [canceled, setCanceled] = useState<boolean>(false);
  const subscription = useRef<any>();
  const cancel$ = new Subject();

  const request$ = fromFetch('https://httpstat.us/200?sleep=5000', {
    headers: {
      'Accept': 'application/json',
    }
  }).pipe(tap(response => {
    console.log(response);
    if (response.ok) {
      console.log('Requisição bem sucedida!');
    } else {
      console.error('Erro na requisição:', response.status);
    }
  }),
  map(async response => {
    const responseData = await response.json();
    setData(responseData);
  }),
  takeUntil(cancel$),
  finalize(() => {
    setLoading(false); 
    setFinished(true); // Define a propriedade finished como true quando a requisição é concluída
  }));

  const makeRequest = () => {
    setLoading(true);
    setCanceled(false);
    setFinished(false);
    subscription.current = request$.subscribe(data => setData(data))
  };

  const cancelRequest = () => {
    setLoading(false);
    setCanceled(true);
    cancel$.next();
    if(subscription.current) {
      subscription.current.unsubscribe();
    }
  };

  console.log('request finished', finished);
  console.log('subscription', subscription);
  console.log('canceled', canceled);
  console.log('data', data);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={makeRequest}>
          Make Request!
        </button>
        <button onClick={cancelRequest} disabled={finished}>
          Cancel Request
        </button>
      </div>
      {loading && <p>
        Loading...
        </p>}
      {!canceled && finished && <p>
        Request finished! {JSON.stringify(data)}
      </p>}
      {canceled && <p>
        Request canceled!
      </p>}
    </>
  )
}

export default App
