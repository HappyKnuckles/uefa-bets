import { createStore } from 'vuex';
import { User } from '@/generated';

export interface State {
  socket: WebSocket | null;
  user: User | null;
  message: string | null;
  add: boolean | null;
}

export const store = createStore<State>({
  state: {
    socket: null,
    user: null,
    message: null,
    add: false
  },
  mutations: {
    setSocket(state, socket) {
      state.socket = socket;
    },
    setUser(state, user) {
      state.user = user;
    },
    setMessage(state, message) {
      state.message = message;
    },
    setAdd(state, add) {
      state.add = !add;
      console.log(add)
      console.log("changed")
    }
  },
  getters: {
    getUser: (state) => {
      state.user = JSON.parse(sessionStorage.getItem("currentuser")!);
      return state.user;
    },
  },
  actions: {
    initWebSocket({ commit }) {
      const socket = new WebSocket('wss://localhost:44320/allHub');

      socket.onopen = () => {
        console.log('WebSocket connection opened');
        const endChar = String.fromCharCode(30);
        socket.send(`{"protocol":"json","version":1}${endChar}`);
      };

      socket.onmessage = (event) => {
        commit('setMessage', event.data);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      commit('setSocket', socket);
    },
    addUser({ commit }, add) {
      commit("setAdd", add);
    },
    loginUser({ commit }, userData) {
      commit("setUser", userData);
    },
    logoutUser({ commit }) {
      commit("setUser", null);
    },
  }
});
