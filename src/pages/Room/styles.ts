import styled from "styled-components";

export const Container = styled.div`
  background-color: #999;
  height: 100vh;
  align-items: center;
  justify-content: space-evenly;
  display: flex;
  flex: 1;

  @media (max-width: 767px) {
    flex-direction: column;
  }

  main {
    width: calc(100% - 400px);
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    display: flex;

    @media (max-width: 767px) {
      flex-direction: column;
    }
  }

  aside {
    width: 400px;
    display: flex;
    height: 100vh;
    background-color: black;
    color: #fff;

    display: flex;
    flex-direction: column;
    padding: 12px;

    p {
      margin: 0;
      font-size: 14px;
    }
  }
`;
