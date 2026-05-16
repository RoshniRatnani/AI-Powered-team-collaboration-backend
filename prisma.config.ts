/// <reference types="node" />
import "dotenv/config";

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
