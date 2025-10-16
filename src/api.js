import axios from "axios";

export default axios.create({
  baseURL: `http://103.157.94.211:8001`,
  timeout: 30000,
});
