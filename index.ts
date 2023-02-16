import { ApolloServer, gql } from "apollo-server";
import { RESTDataSource } from "apollo-datasource-rest";

class OpenWeatherMapAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "http://api.openweathermap.org/data/2.5/weather";
  }

  async getWeather(city: string, apiKey: string) {
    const result = await this.get(`?q=${city}&appid=${apiKey}`);
    return result;
  }
}

class StarWarsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://swapi.dev/api";
  }

  async getPerson(id: number) {
    const result = await this.get(`/people/${id}`);
    return result;
  }
}

const typeDefs = gql`
  type Query {
    getWeather(city: String, apiKey: String): Weather
    getPerson(id: Int): Person
  }

  type Weather {
    name: String
    weather: [WeatherInfo]
    main: MainInfo
  }

  type WeatherInfo {
    main: String
    description: String
  }

  type MainInfo {
    temp: Float
    pressure: Float
    humidity: Float
  }

  type Person {
    name: String
    height: String
    mass: String
    hair_color: String
    skin_color: String
    eye_color: String
    birth_year: String
    gender: String
    homeworld: String
    films: [String]
    species: [String]
    vehicles: [String]
    starships: [String]
    created: String
    edited: String
    url: String
  }
`;

const resolvers = {
  Query: {
    getWeather: (_, { city, apiKey }, { dataSources }) =>
      dataSources.openWeatherMapAPI.getWeather(city, apiKey),
    getPerson: (_, { id }, { dataSources }) =>
      dataSources.starWarsAPI.getPerson(id)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    openWeatherMapAPI: new OpenWeatherMapAPI(),
    starWarsAPI: new StarWarsAPI()
  })
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});