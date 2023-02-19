import { ApolloServer, gql } from "apollo-server";
import { RESTDataSource } from "apollo-datasource-rest"
import { Sequelize, DataTypes } from 'sequelize';
import { makeExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';
import readFileSync from 'fs';
import buildSchema from 'graphql';
import { resolve } from 'path';


const NASA_KEY = 'B5A0xnkRpcwt8awTgWYeBA68Id82NYc1xbaNy5RY';
const NEW_WEATHERAPI_KEY = 'cfe59a0f372b45ca945120624231802';
const VISUALCROSSING = '6C3N39FWNB3VLTL9DZYX9PXSA'


class visualCrossingAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'
    }
    async getVisualCrossing(latitude, longitude, VISUALCROSSING) {
        this.VISUALCROSSING = VISUALCROSSING;
        return this.get(`${latitude},${longitude}?key=6C3N39FWNB3VLTL9DZYX9PXSA`)
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

class NasaAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = "https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}"
    }
    async getAPOD() {
        return this.get(`apod?api_key=${NASA_KEY}`)
    }
}

class TimeZoneAPI extends RESTDataSource{
    constructor() {
        super();
        this.baseURL = "https://www.timeapi.io/api/TimeZone/"
        
    }
    async getTimeZone(tzone) {
        return this.get(`zone?timeZone=${tzone}`)
    }
}

const fetchTzone = async(tzone)=>{
    console.log("hier")
    const response = await fetch(`https://www.timeapi.io/api/TimeZone/zone?timeZone=America/New_York`)
    console.log(response);
    const data = await response.json();
    return data;
}



const typeDefs = `
  type Query {
    person(id: ID!): Person
    apod(apiKey: String!): APOD
    visualCrossing(latitude: Float, longitude: Float): VisualCrossing
    tzone(tzone: String!): Tzone
  }
  type Mutation {
    createPerson(input: CreatePersonInput!): Person!
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
  
  type VisualCrossing{
    queryCost: Int
    latitude: Float
    longitude: Float
    resolvedAddress: String
    address: String
    timezone: String
    tzoffset: Int
    description: String
    tzone: Tzone
  }

  type APOD {
    date: String
    explanation: String
    title: String
    url: String
  }

  type Tzone {
    timeZone: String
    currentLocalTime: String
    currentUtcOffset: TimeOffset
    standardUtcOffset: TimeOffset
    hasDayLightSaving: Boolean
    isDayLightSavingActive: Boolean
    dstInterval: DSTInterval
  }
  
  type TimeOffset {
    seconds: Float
    milliseconds: Float
    ticks: Float
    nanoseconds: Float
  }
  
  type DSTInterval {
    dstName: String
    dstOffsetToUtc: TimeOffset
    dstOffsetToStandardTime: TimeOffset
    dstStart: String
    dstEnd: String
    dstDuration: Duration
  }
  
  type Duration {
    days: Int
    nanosecondOfDay: Int
    hours: Int
    minutes: Int
    seconds: Int
    milliseconds: Int
    subsecondTicks: Int
    subsecondNanoseconds: Int
    bclCompatibleTicks: Float
    totalDays: Int
    totalHours: Int
    totalMinutes: Int
    totalSeconds: Int
    totalMilliseconds: Int
    totalTicks: Int
    totalNanoseconds: Int
  }

  input CreatePersonInput {
    name: String
    height: String
  }
`;

const resolvers = {
    Query: {
        person: (_root, { id }, { dataSources }) => {
            return dataSources.starWarsAPI.getPerson(id);
        },
        apod: (_root, { NASA_KEY }, { dataSources }) => {
            return dataSources.NasaAPI.getAPOD();
        },
        visualCrossing:(_root, { latitude, longitude }, { dataSources }) => {
            return dataSources.visualCrossingAPI.getVisualCrossing(latitude, longitude);
        },
        tzone: (_root, { tzone }, { dataSources }) => {
            return dataSources.timeZoneAPI.getTimeZone(tzone);
        }
    }, VisualCrossing:{
        tzone: async(parent)=>{
            const {tzone} = parent;
            const tzoneData = await fetchTzone(tzone)
            return tzoneData;
        },
    },
    Mutation: {
        createPerson: async (_parent, { input }, _context) => {
            const { name, height } = input;
            const newPerson = await Person.create({ name, height });
            return newPerson;
        },
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        starWarsAPI: new StarWarsAPI(),
        NasaAPI: new NasaAPI(),
        visualCrossingAPI: new visualCrossingAPI(),
        timeZoneAPI: new TimeZoneAPI(),
    }),
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
