import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.js";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter(
  [
    { path: "*", Component: App },
  ],
  {
    basename: `/${document.baseURI.split("/")[3]}`,
  }
);

function Index() {
  return <RouterProvider router={router} />;
}

createRoot(document.body).render(<Index />);