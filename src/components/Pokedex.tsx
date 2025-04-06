import React, { useEffect, useState } from "react";
import api from "../services/api";

interface PokemonDetails {
  id: number;
  name: string;
  types: string[];
  image: string;
  height: number;
  weight: number;
  abilities: string[];
  description: string;
}

interface PokemonBasic {
  name: string;
  url: string;
}

interface PokemonData {
  id: number;
  name: string;
  image: string;
  types: string[];
}

const Pokedex: React.FC = () => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [pokemons, setPokemons] = useState<PokemonData[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await api.get(`pokemon?limit=151`);
        const results: PokemonBasic[] = response.data.results;

        const detailed = await Promise.all(
          results.map(async (pokemon) => {
            const res = await api.get(pokemon.url);
            return {
              id: res.data.id,
              name: res.data.name,
              image: res.data.sprites.other["official-artwork"].front_default,
              types: res.data.types.map((t: any) => t.type.name),
            };
          })
        );

        setPokemons(detailed);
      } catch (err) {
        console.error("Erro ao carregar pokémons:", err);
      }
    };

    fetchPokemons();
  }, []);

  const filteredPokemons = pokemons.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? pokemon.types.includes(typeFilter) : true;
    return matchesName && matchesType;
  });

  const typeTranslations: Record<string, string> = {
    normal: "normal",
    fire: "fogo",
    water: "água",
    electric: "elétrico",
    grass: "grama",
    ice: "gelo",
    fighting: "lutador",
    poison: "venenoso",
    ground: "terrestre",
    flying: "voador",
    psychic: "psíquico",
    bug: "inseto",
    rock: "pedra",
    ghost: "fantasma",
    dragon: "dragão",
    dark: "sombrio",
    steel: "aço",
    fairy: "fada",
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fire: "#F08030",
      water: "#6890F0",
      grass: "#78C850",
      electric: "#F8D030",
      psychic: "#F85888",
      ice: "#98D8D8",
      dragon: "#7038F8",
      dark: "#705848",
      fairy: "#EE99AC",
      normal: "#A8A878",
      bug: "#A8B820",
      poison: "#A040A0",
      ground: "#E0C068",
      flying: "#A890F0",
      fighting: "#C03028",
      rock: "#B8A038",
      ghost: "#705898",
      steel: "#B8B8D0",
    };

    return colors[type] || "#ddd";
  };

  const fetchPokemonDetails = async (id: number) => {
    try {
      const res = await api.get(`pokemon/${id}`);
      const species = await api.get(`pokemon-species/${id}`);
  
      const details: PokemonDetails = {
        id: res.data.id,
        name: res.data.name,
        types: res.data.types.map((t: any) => t.type.name),
        image: res.data.sprites.other["official-artwork"].front_default,
        height: res.data.height / 10,
        weight: res.data.weight / 10,
        abilities: res.data.abilities.map((a: any) => a.ability.name),
        description:
          species.data.flavor_text_entries.find(
            (entry: any) => entry.language.name === "pt"
          )?.flavor_text.replace(/\f/g, " ") || "",
      };
  
      new Audio("/sounds/levelup.mp3").play();
setRevealing(true); // inicia suspense

setTimeout(() => {
  setSelectedPokemon(details);
  setShowModal(true);
  setRevealing(false); // encerra suspense
}, 1000); // tempo do suspense (2.5s)
    } catch (err) {
      console.error("Erro ao carregar detalhes do pokémon:", err);
    }
  };

  return (
    <>
    {/* Botão de abrir/fechar o menu */}
<div
  style={{
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1001,
  }}
>
  <button
    onClick={() => setShowTypeMenu(!showTypeMenu)}
    style={{
      padding: "6px 10px",
      borderRadius: "8px",
      backgroundColor: "#444",
      color: "#fff",
      border: "none",
      fontSize: "12px",
      cursor: "pointer",
    }}
  >
    {showTypeMenu ? "Fechar Tipos" : "Mostrar Tipos"}
  </button>
</div>
{showTypeMenu && (
  <div
    style={{
      position: "fixed",
      top: "60px",
      left: "20px",
      backgroundColor: "#fff",
      padding: "10px",
      borderRadius: "12px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1000,
      maxWidth: "150px",
      maxHeight: "80vh",
      overflowY: "auto",
    }}
  >
    <h4 style={{ margin: "0 0 10px", fontSize: "14px", textAlign: "center" }}>Tipos</h4>
    {Object.entries(typeTranslations).map(([type, name]) => (
      <div
        key={type}
        onClick={() => setTypeFilter(type)}
        style={{
          backgroundColor: getTypeColor(type),
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "8px",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: "bold",
          textTransform: "capitalize",
          textAlign: "center",
          cursor: "pointer",
          opacity: typeFilter === type ? 1 : 0.7,
          border: typeFilter === type ? "2px solid #fff" : "none",
        }}
      >
        {name}
      </div>
    ))}
    {typeFilter && (
      <button
        onClick={() => setTypeFilter(null)}
        style={{
          marginTop: "10px",
          padding: "4px 8px",
          fontSize: "12px",
          borderRadius: "6px",
          backgroundColor: "#ccc",
          border: "none",
          cursor: "pointer",
        }}
      >
        Limpar filtro
      </button>
    )}
  </div>
)}

<div
  style={{
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    minHeight: "100vh",
    color: "#fff",
  }}
>
        <h1 style={{ textAlign: "center" }}>Pokédex</h1>

        <input
          type="text"
          placeholder="Buscar pokémon"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            display: "block",
            margin: "0 auto 20px",
            padding: "12px",
            width: "300px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            backgroundColor: "#ffffffcc",
            color: "#333",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredPokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              onClick={() => fetchPokemonDetails(pokemon.id)}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
                borderRadius: "12px",
                padding: "10px",
                textAlign: "center",
                backgroundColor: getTypeColor(pokemon.types[0]),
                boxShadow: `0 0 15px ${getTypeColor(pokemon.types[0])}90`,
                color: "#fff",
                transform: "scale(1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <img
                src={pokemon.image}
                alt={pokemon.name}
                width={100}
                height={100}
                style={{ backgroundColor: "#fff", borderRadius: "50%" }}
              />
              <p
                style={{
                  marginTop: "8px",
                  textTransform: "capitalize",
                  fontWeight: "bold",
                }}
              >
                {pokemon.name}
              </p>
              <div>
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    style={{
                      backgroundColor: "#fff",
                      color: "#333",
                      borderRadius: "10px",
                      padding: "2px 8px",
                      margin: "2px",
                      display: "inline-block",
                      fontSize: "0.8em",
                      textTransform: "capitalize",
                      fontWeight: "bold",
                    }}
                  >
                    {typeTranslations[type] || type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {revealing && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#000",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        fontSize: "28px",
        fontWeight: "bold",
        animation: "pulse 1s infinite",
      }}
    >
      Quem é esse pokemon?
    </div>
    <div
      style={{
        width: "150px",
        height: "150px",
        marginTop: "20px",
        background: "url('/images/question.png') center center / contain no-repeat",
        filter: "brightness(0) contrast(2)",
      }}
    ></div>
  </div>
)}

      {/* MODAL */}
      {showModal && selectedPokemon && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              textAlign: "center",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h2 style={{ textTransform: "capitalize" }}>{selectedPokemon.name}</h2>
            <img
              src={selectedPokemon.image}
              alt={selectedPokemon.name}
              style={{ width: "120px", marginBottom: "10px" }}
            />
            <p>
              <strong>Tipo:</strong> {selectedPokemon.types.map((t) => typeTranslations[t] || t).join(", ")}
            </p>
            <p>
              <strong>Peso:</strong> {selectedPokemon.weight} kg
            </p>
            <p>
              <strong>Altura:</strong> {selectedPokemon.height} m
            </p>
            <p>
              <strong>Habilidades:</strong>{" "}
              {selectedPokemon.abilities.map((a) => (
                <span key={a} style={{ marginRight: "6px" }}>
                  {a}
                </span>
              ))}
            </p>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "0.9em",
                marginTop: "10px",
              }}
            >
              {selectedPokemon.description}
            </p>
            <button
  onClick={() => setShowModal(false)}
  style={{
    marginTop: "10px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "#ff3d3d",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  }}
>
  Fechar
</button>
          </div>
        </div>
      )}
      <div
  style={{
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#18dada",
    padding: "12px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    zIndex: 1001,
  }}
>
  <button
    onClick={() => window.location.href = "/jogo"}
    style={{
      background: "none",
      border: "none",
      fontWeight: "bold",
      fontSize: "14px",
      cursor: "pointer",
      color: "#2a10ab",
      textAlign: "center",
    }}
  >
    Quer desafiar seu conhecimento no mundo de Pokémon?
  </button>
</div>
    </>
  );
};

export default Pokedex;
