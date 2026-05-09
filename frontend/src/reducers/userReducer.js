import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  user: {
    id: "",
    username: "",
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logIn: (state, action) => {
      localStorage.setItem("token", action.payload.token);
      const user = { username: action.payload.username };
      localStorage.setItem("user", JSON.stringify(user));
      state.token = action.payload.token;
      state.user = user;
    },
    setUser: (state, action) => {
      state.token = action.payload.token;
      state.user = JSON.parse(action.payload.user);
    },
    logOut: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.token = "";
      state.user.id = "";
      state.user.username = "";
    },
  },
});

export const { logIn, setUser, logOut } = userSlice.actions;
export default userSlice.reducer;
