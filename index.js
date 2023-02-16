const { ApolloServer } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");

class WeatherAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = "http://api.openweathermap.org/data/2.5/";
    }

    async getWeather(city, apiKey) {
        return this.get(`weather?q=${city}&appid=${apiKey}`);
    }
}

class StarWarsAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = "https://swapi.dev/api/";
    }

    async getPerson(id) {
        return this.get(`people/${id}`);
    }
}

class PokemonAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseUrl = "https://pokeapi.co/api/v2/";
    }
    async getPokemon(id) {
        return this.get(`pokemon/${id}`)
    }
}

class NasaAPI extends RESTDataSource{
    constructor(){
        super();
        this.baseURL="https://api.nasa.gov/planetary/";
    }
    async getAPOD(date){
        return this.get(`apod?/${date}api_key=${DEMO_KEY}`)
    }
}

const typeDefs = `
  type Weather {
    main: String
    description: String
  }

  type Query {
    weather(city: String!, apiKey: String!): Weather
    person(id: ID!): Person
    pokemons(name: String!):[Pokemon]
    pokemon(id:ID!): Pokemon
    apod(date: String!, apiKey: String!): APOD
  }

  type Person {
    id: ID!
    name: String
    height: String
    mass: String
    hair_color: String
    skin_color: String
    eye_color: String
    birth_year: String
    gender: String
  }

  type APOD {
    date: String!
    explanation: String
    title: String
    url: String
  }

  type Pokemon {
    id: ID
    name: String!
    types: [String]
    height: Float
    weight: Float
  }
`;

const resolvers = {
    Query: {
        weather: (root, { city, apiKey }, { dataSources }) => {
            return dataSources.weatherAPI.getWeather(city, apiKey);
        },
        person: (root, { id }, { dataSources }) => {
            return dataSources.starWarsAPI.getPerson(id);
        },
        pokemon: (root, { id }, { dataSources }) => {
            return dataSources.PokemonAPI.getPokemon(id);
        },
        pokemons: (root, { name }, { dataSources }) => {
            return dataSources.PokemonAPI.getPokemon(id);
        },
        apod: (root, { date, DEMO_KEY }, { dataSources})=> {
            return dataSources.NasaAPI.getAPOD(date);
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        weatherAPI: new WeatherAPI(),
        starWarsAPI: new StarWarsAPI(),
        PokemonAPI: new PokemonAPI(),
    }),
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
