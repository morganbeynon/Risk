import React, { useEffect, useState } from "react";
import socket from '../socket';
import { useNavigate, useLocation } from "react-router-dom";
import objective from "../images/objective.png"
import gameplay from "../images/gameplay.png"
import map from "../images/map.png"
import link from "../images/link.png"
import basicsD from "../images/basicsD.png"
import troopCount from "../images/troopCount.png"
import dError from "../images/deployError.png"
import basicsA from "../images/basicsA.png"
import success from "../images/successAttack.png"
import fail from "../images/unsuccess.png"
import basicsR from "../images/basicsR.png"
import controls from "../images/controls.png"
import selectAmount from "../images/selectAmount.png"
import view from "../images/view.png"
import redeem from "../images/redeem.png"
import dice from "../images/dice.png"
import values from "../images/values.png"

export default function InstructionScreen(){
    const navigate = useNavigate();
    const tabs = ["Overview", "Deploy", "Attack", "Reinforce", "Cards"]
    const [activeTab, setActiveTab] = useState("Overview");
    const [index, setIndex] = useState(0);
    const location = useLocation();
    const { name, lobby, isHost } = location.state

    const exit = () => {
        navigate("/", { state: { name, lobby, isHost } })
    }
    const overviewSlides = [
        {
            image: objective,
            title: "Objective",
            description: `The objective of the game is to conquer every territory on the map. \n
            Each player makes strategic moves during their turn to achieve this.`
        },
        {
            image: gameplay,
            title: "Gameplay",
            description: `Each players turn is split into 3 moves: Deploy, Attack and Reinforce. \n
            Each allowing a different impact on the game. \n
            The current phase is highlighted on the game bar.
            `
        },
        {
            image: map,
            title: "Map",
            description: `Each coloured square on the map represents the equivalent colour players territory. \n
            A territory can access the 8 surrounding squares.\n
            The dark blue background is not playable.\n
            Each map is randomly generated each game.`
        },
        {
            image: link,
            title: "Links",
            description: `Thin black lines between disconnected territories represent links. \n
            A player can Attack or Reinforce across a link.`
        }
    ]
    const deploySlides = [
        {
            image: basicsD,
            title: "Basics",
            description: `You can only deploy troops to territories you own (squares your colour).`
        },
        {
            image: troopCount,
            title: "Troop Count",
            description: `Each turn you have a maximum amount of troops you can deploy. \n
            This is calculated from your owned territories and is shown on the game bar.\n`
        },
        {
            image: dError,
            title: "Deploy error",
            description:   `All troops must be deployed before moving onto the Attack phase.`
        }
    ]
    const attackSlides = [
        {
            image: basicsA,
            title: "Basics",
            description: `A territory can attack one of its 8 neighbouring territories or through a link if it has 2+ troops and the other troop is an enemy. \n
            You must click an owned source territory and then a neighbour to carry out an attack.`
        },
        {
            image: dice,
            title:"Dice Rolls",
            description: `Each attack is calculated using dice rolls.\n
            An attacker can use up to 3 die whilst a defender can use up to 2.\n
            Results are sorted in descending order and compared in pairs.`
        },
        {
            image: success,
            title: "Succesful Attacks",
            description: `After a succesful attack, you must move atleast 1 troop to the conquered territory. \n
            You can input your chosen amount in the pop up. \n
            Remaining amounts of troops will stay in the source territory.`
        },
        {
            image: fail,
            title: "Failed Attacks",
            description: `Failed attacks result in your territory troop count being reduced to 1.`
        }
    ]
    const reinforceSlides = [
        {
            image: basicsR,
            title: "Basics",
            description: `Once a turn, you can move troops from a territory to another. \n
            The territories must be connected using a path of neighbouring owned territories and links.`
        },
        {
            image: controls,
            title: "Controls",
            description: `You must click the source territory you wish to move troops from and then the target territory to complete a reinforcement.`
        },
        {
            image: selectAmount,
            title: "Selecting Amount",
            description: `A pop up allows for you to select how many troops to move.\n
            Any remaining troops are left in the source territory.`
        }         

    ]
    const cardSlides = [
        {
            image: values,
            title: "Values",
            description: `Cards are rewarded after a succesful attack.\n
             There are three types: Soldier, Cavalry and Tank \n
             You need to three of a kind or one of each to redeem troops. \n
             The resulting amount of each combination is pictured above.\n
             Each card has a territory ID. If your card has aterritory ID belonging to you, a +2 troop bonus is added.`
        },
        {
            image: view,
            title: "How to View",
            description: `Your cards can be viewed by selecting the cards icon on the game bar. \n
            You can only view your cards during your turn.`
        },
        {
            image: redeem,
            title: "Redeeming Cards",
            description: `You can only redeem during the deploy phase and your cards match the requirements. \n
            You redeem by clicking the Redeem button. The troops are added to your deployable troop count`
        },
    ];

    const slideMap = {
    Overview: overviewSlides,
    Deploy: deploySlides,
    Attack: attackSlides,
    Reinforce: reinforceSlides,
    Cards: cardSlides,
    };
    
    const slides = slideMap[activeTab];
    const current = slides[index];

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIndex(0);
    };

    const previous = () => setIndex(i => Math.max(0, i - 1));
    const next = () => setIndex(i => Math.min(slides.length - 1, i + 1));
    
    useEffect(() => {
        socket.on("game-start", () => {
            navigate('/GameScreen');
        });

        return () => {
            socket.off("game-start");
        };
    }, [navigate]);

    return (
        <div style={{
            width: "100vw", 
            height: "100vh", 
            display: "flex",
            flexDirection: "column", 
            background: "#1a2a6c",
            alignItems: "center", 
            justifyContent: "center", 
            color: "white"
        }}>
            <div style={{ 
                display: "flex", 
                gap: "10px", 
                marginBottom: "20px" }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        style={{
                            background: activeTab === tab ? "white" : "black",
                            color: activeTab === tab ? "#1a2a6c" : "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: activeTab === tab ? "bold" : "normal",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style = {{
                display: "flex",
                flexDirection: "row",
                alignItems: "center", 
                justifyContent: "center",
                gap: "20px",   
            }}>
                <button
                                style={{
                                    background: "black",
                                    border: "black",
                                    padding: "15px 30px",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    color: "white",
                                    borderRadius: "10px",
                                    marginTop: "20px"
                                }}
                                onClick={previous}
                            >
                                Previous
                </button>
                
                <div style={{
                    background: "black",
                    border: "black",
                    borderRadius: "16px",
                    padding: "32px",
                    width: "480px",
                    textAlign: "center",
                }}>
                    <h2 style={{ fontSize: "24px", margin: "0 0 12px" }}>{current.title}</h2>
                    <img
                    src={current.image}
                    alt={current.title}
                    style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "contain",
                        borderRadius: "10px",
                        marginBottom: "20px",
                    }}
                    />
                    
                    <p style={{ fontSize: "16px", lineHeight: 1.7, opacity: 0.8, margin: 0 }}>
                    {current.description}
                    </p>
                </div>

                <button
                                style={{
                                    background: "black",
                                    border: "black",
                                    padding: "15px 30px",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    color: "white",
                                    borderRadius: "10px",
                                    marginTop: "20px"
                                }}
                                onClick={next}
                            >
                                Next            
                </button>
            </div>
            <button
                                style={{
                                    background: "black",
                                    border: "black",
                                    padding: "7.5px 15px",
                                    fontSize: "15px",
                                    fontWeight: "bold",
                                    color: "white",
                                    borderRadius: "10px",
                                    marginTop: "20px"
                                }}
                                onClick={exit}
                            >
                                Exit            
            </button>

        </div>


    )
}