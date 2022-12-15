import React, { useState } from "react";

import Head from "next/head";

export default function MyForm() {
  // Set up state to store the value of the text input
  const [inputValue, setInputValue] = useState(null);

  // Set up state to store the child components that will be created
  const [childComponents, setChildComponents] = useState([]);

  // Handle the submit button being clicked
  const handleSubmit = (event) => {
    event.preventDefault();

    // Create a new child component with the input value
    const newChildComponent = <p>{inputValue}</p>

    // Add the new child component to the list of child components
    setChildComponents((childComponents) => [
      ...childComponents,
      newChildComponent,
    ]);
  };

  return (
    <>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      {/* The text input field */}
      <main>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* The submit button */}
        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>

        {/* The list of child components */}
        {childComponents.map((childComponent) => childComponent)}
      </main>
      <style jsx>{``}</style>
      <style jsx global>
        {`
          body {
            background-color: #333;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
          }
          main {
            color: white;
          }
          a {
            color: white;
          }
          .row {
            display: flex;
            flex-wrap: nowrap;
            gap: 10px;
            // justify-content: space-around;
            align-items: flex-start;
          }
          img {
            // max-width: 147px;
            max-height: 105px;
            margin-top: 10px;
            margin-bottom: 5px;
            border-radius: 5px;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </>
  );
}
