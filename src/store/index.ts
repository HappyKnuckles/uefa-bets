import { createStore } from "vuex";
interface RootState {
  user: any; // Adjust this type according to your actual state structure
}

const store = createStore<RootState>({
  state() {
    return {
      user: null,
    };
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      console.log("User set in store");
      console.log(state.user);
    },
  },
  getters: {
    getUser: (state) => {
      console.log("Retrieving user...");
      return state.user;
    },
  },
  actions: {
    loginUser({ commit }, userData) {
      commit("SET_CURRENT_USER", userData);
    },
    logoutUser({ commit }) {
      commit("CLEAR_CURRENT_USER");
    },
  }
})
export default store;
