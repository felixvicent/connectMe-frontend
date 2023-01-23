import styled from "styled-components";

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .input-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    input {
      font-size: 24px;
      display: block;
      padding: 10px 20px;
      margin: 10px;
      border: 1px solid black;
      border-radius: 12px;
      width: 100%;
      box-sizing: border-box;
    }

    button {
      display: block;
      font-size: 24px;
      width: 100%;
      padding: 10px 20px;
      cursor: pointer;
    }
  }
`;
