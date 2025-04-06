import React, { useEffect, useState } from "react";
import api from "../services/api";

interface PokemonOption {
  id: number;
  name: string;
  image: string;
}

const Jogo: React.FC = () => {
  const [round, setRound] = useState(1);
  const [correctPokemon, setCorrectPokemon] = useState<PokemonOption | null>(null);
  const [options, setOptions] = useState<PokemonOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateRound();
  }, [round]);

  const generateRound = async () => {
    setSelected(null);
    setIsLoading(true);

    const ids = new Set<number>();
    while (ids.size < 4) {
      ids.add(Math.floor(Math.random() * 151) + 1);
    }

    const idArray = Array.from(ids);

    const results = await Promise.all(
      idArray.map(async (id) => {
        const res = await api.get(`pokemon/${id}`);
        return {
          id: res.data.id,
          name: res.data.name,
          image: res.data.sprites.other["official-artwork"].front_default,
        };
      })
    );

    const correct = results[Math.floor(Math.random() * results.length)];

    new Audio("/sounds/whosthatpokemon.mp3.mp3").play();

    setTimeout(() => {
      setCorrectPokemon(correct);
      setOptions(shuffleArray(results));
      setIsLoading(false);
    }, 2000);
  };

  const shuffleArray = (arr: any[]) => {
    return arr.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (name: string) => {
    setSelected(name);
    if (name === correctPokemon?.name) {
      setScore(score + 1);
    }
    setTimeout(() => {
      setRound(round + 1);
    }, 1500);
  };

  if (round > 10) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Fim de jogo!</h1>
        <p style={styles.text}>Pontuação final: {score} / 10</p>
        <button style={styles.button} onClick={() => {
          setRound(1);
          setScore(0);
        }}>Jogar novamente</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <div style={styles.topButton}>
          <button
            onClick={() => window.location.href = "/"}
            style={styles.backButton}
          >
            ⬅ Voltar para Pokédex
          </button>
        </div>
        <div style={styles.container}>
          <h1 style={styles.title}>Quem é esse Pokémon?</h1>
          <p style={styles.text}>Preparando a próxima rodada...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Botão fixo no topo esquerdo */}
      <div style={styles.topButton}>
        <button
          onClick={() => window.location.href = "/"}
          style={styles.backButton}
        >
          ⬅ Voltar para Pokédex
        </button>
      </div>

      <div style={styles.container}>
        <h1 style={styles.title}>Quem é esse pokémon?</h1>
        <p style={styles.text}>Rodada {round} de 10</p>

        {correctPokemon && !isLoading && (
          <img
            src={correctPokemon.image}
            alt="silhueta"
            style={{
              width: 200,
              height: 200,
              filter: selected ? "brightness(1)" : "brightness(0) contrast(2)",
              marginBottom: 20,
              transition: "filter 0.3s",
            }}
          />
        )}

        <div style={styles.optionsContainer}>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt.name)}
              disabled={!!selected || isLoading}
              style={{
                ...styles.optionButton,
                backgroundColor:
                  selected === null
                    ? "#eee"
                    : opt.name === correctPokemon?.name
                    ? "#4caf50"
                    : opt.name === selected
                    ? "#f44336"
                    : "#ddd",
              }}
            >
              {opt.name.charAt(0).toUpperCase() + opt.name.slice(1)}
            </button>
          ))}
        </div>

        {selected && (
          <p style={styles.text}>
            {selected === correctPokemon?.name ? "Acertou!" : `Errou! Era ${correctPokemon?.name}`}
          </p>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    minHeight: "100vh",
    color: "#fff",
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  text: {
    fontSize: "18px",
    marginBottom: "20px",
  },
  optionsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    justifyContent: "center",
    maxWidth: "500px",
    margin: "0 auto",
  },
  optionButton: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "16px",
    backgroundColor: "#2196f3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  topButton: {
    position: "fixed" as const,
    top: "20px",
    left: "20px",
    zIndex: 1000,
  },
  backButton: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "bold" as const,
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
};

export default Jogo;
