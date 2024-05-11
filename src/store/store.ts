import { createStore } from 'vuex';
import { Game, User } from '@/generated';
import apiService from '@/services/apiService';

export interface State {
  socket: WebSocket | null;
  user: User | null;
  message: string | null;
  add: boolean | null;
  games: Game [] | null;
}

export const store = createStore<State>({
  state: {
    socket: null,
    user: null,
    message: null,
    add: false,
    games: []
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
    },
    setGames(state, games) {
      state.games = games;
    }
  },
  getters: {
    getUser: (state) => {
      state.user = JSON.parse(sessionStorage.getItem("currentuser")!);
      return state.user;
    },
    getGames: (state) => {
      return state.games;
    }
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
    async fetchGames({ commit }) {
      try {
        const response = await apiService.gameApi.apiGameGet();
        commit('setGames', response.data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
        throw error; 
      }
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
