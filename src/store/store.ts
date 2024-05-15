import { createStore } from 'vuex';
import { CommunityMembersDto, Game, User } from '@/generated';
import apiService from '@/services/apiService';

export interface State {
  socket: WebSocket | null;
  user: User | null;
  message: string | null;
  add: boolean | null;
  games: Game [] | null;
  userCommunities: CommunityMembersDto [] | null;
  loadingUserCommunities: boolean | null;
  loadingGames: boolean | null;
  communityId: string | null;
}

export const store = createStore<State>({
  state: {
    socket: null,
    user: null,
    message: null,
    add: false,
    games: [],
    userCommunities: [],
    loadingUserCommunities: false,
    loadingGames: false,
    communityId: ''
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
      state.add = add;
    },
    setGames(state, games) {
      state.games = games;
    },
    setUserCommunities(state, userCommunities){
      state.userCommunities = userCommunities;
    },
    setLoadingUserCommunities(state, loadingUserCommunities){
      state.loadingUserCommunities = loadingUserCommunities;
    },
    setLoadingGames(state, loadingGames) {
      state.loadingGames = loadingGames;
    },
    setCommunityId(state, id){
      state.communityId = id;
    }
  },
  getters: {
    getUser: (state) => {
      state.user = JSON.parse(sessionStorage.getItem("currentuser")!);
      return state.user;
    },
    getGames: (state) => {
      return state.games;
    },
    getUserCommunities: (state) => {
      return state.userCommunities;
    },
    getLoadingGames: (state) => {
      return state.loadingGames;
    },
    getLoadingUserCommunities: (state) => {
      return state.loadingUserCommunities;
    },
    getAddValue: (state) => {
      return state.add;
    },
    getCommunityId: (state) => {
      return state.communityId;
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
        commit('setLoadingGames', true);
        const response = await apiService.gameApi.apiGameGet();
        commit('setGames', response.data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
        throw error; 
      } finally {
        commit('setLoadingGames', false);
      }
    },
    async fetchUserCommunities({ commit }) {
      try {
        commit('setLoadingUserCommunities', true);
        const response = await apiService.userCommunityApi.apiUserCommunityShowUserCommunitiesGet(this.state.user!.userId);
        commit('setUserCommunities', response.data);
      } catch (error){
        console.log(error);
      } finally {
        commit('setLoadingUserCommunities', false);
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
