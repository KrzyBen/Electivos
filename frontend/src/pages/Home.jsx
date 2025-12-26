import React from "react";
import electivosImg from "../assets/PersonIcon.svg";

const Home = () => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh'}}>
      <img src={electivosImg} alt="Electivos" style={{width: 180, marginBottom: 32}} />
      <h1>Bienvenido al sistema de Electivos</h1>
      <p style={{maxWidth: 500, textAlign: 'center', marginTop: 16}}>
        Aquí podrás gestionar, inscribirte y consultar los electivos disponibles en tu carrera.
      </p>
    </div>
  );
}

export default Home