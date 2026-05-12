import React from 'react';
import horizontal from "../images/horizontal.png";
import vertical from "../images/vertical.png";
import diagonalLeft from "../images/leftDiagonal.png";
import diagonalRight from "../images/rightDiagonal.png";
import northEast from "../images/northEast.png";
import northWest from "../images/northWest.png";
import southEast from "../images/southEast.png";
import southWest from "../images/southWest.png";


export default function TerritoryCell({
  colour,
  troopCount,
  onClick,
  selected,
  direction,
  isLink
}) {
  let photoD = null;
  //translate direction
  if (direction === "Vertical") {
    photoD = vertical;
  } 
  else if (direction === "Horizontal") {
    photoD = horizontal;
  } 
  else if (direction === "Diagonal Left") {
    photoD = diagonalLeft;
  } 
  else if (direction === "Diagonal Right") {
    photoD = diagonalRight;
  }
  else if (direction === "CornerNE") {
    photoD = northEast;
  }
  else if (direction === "CornerNW") {
    photoD = northWest;
  }
  else if (direction === "CornerSE") {
    photoD = southEast;
  }
  else if (direction === "CornerSW") {
    photoD = southWest;
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: colour,
        width: 45,
        height: 45,
        position: "relative",
        border: selected ? "3px solid black" : null
      }}
    >
      {isLink && photoD && (
        //get link direciton image
        <img
          src={photoD}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none"
          }}
        />
      )}

      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          pointerEvents: "none"
        }}
      >
        {troopCount}
      </span>
    </div>
  );
}
