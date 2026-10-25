import { h } from "preact";
import { useTranslation } from "react-i18next";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect, useState } from "preact/hooks";

export default function HelpTutorial(props) {
  const { t } = useTranslation();
  const [isNavigating, setIsNavigating] = useState(false);
  const path = window.location.pathname;

  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: t("tutorial_1_title"), description: t("tutorial_1_description"), showButtons: ["next", "close"],
            onNextClick: () => {
              if (!document.getElementById("groups-nav").classList.contains("active")) {
                document.getElementById("groups-nav").click();
              }
              driverObj.moveNext();
            },
          }
        },
        {
          element: "#nav-group-list",
          popover: {
            waitForElement: 5000, title: t("tutorial_2_title"), description: t("tutorial_2_description"), side: "left",
            onNextClick: () => {
              const el = document.getElementById("nav-group-list").getElementsByClassName("nav-group-item")[0];
              if (el) {
                if (el.href.includes(path)) {
                  driverObj.moveNext();
                } else {
                  setIsNavigating(true);
                  localStorage.setItem(props.TOUR_KEY, "2");
                  driverObj.destroy();
                  el.click();
                }
              } else {
                alert("Can't continue without a group!");
              }
            },
          }
        },
        { element: "main", popover: { waitForElement: 5000, title: t("tutorial_3_title"), description: t("tutorial_3_description"), showButtons: ["next", "close"], side: "top" } },
        { element: ".write-button", popover: { waitForElement: 5000, title: t("tutorial_4_title"), description: t("tutorial_4_description"), side: "top" } },
        {
          element: "#feed", popover: {
            title: t("tutorial_5_title"), description: t("tutorial_5_description"),
            onNextClick: () => {
              setIsNavigating(true);
              localStorage.setItem(props.TOUR_KEY, "5");
              driverObj.destroy();
              document.getElementById("feed").click();
            },
          
          } },
        {
          element: "main", popover: {
            waitForElement: 5000, title: t("tutorial_6_title"), description: t("tutorial_6_description"), showButtons: ["next", "close"],
            onNextClick: () => {
              setIsNavigating(true);
              localStorage.setItem(props.TOUR_KEY, "6");
              driverObj.destroy();
              const el = document.getElementById("group").getElementsByClassName("message-preview")[0];
              if (el) {
                el.click();
              } else {
                alert("Try the tutorial again once there's a post in the group!");
              }
            },
          }
        },
        { element: ".message", popover: { waitForElement: 5000, title: t("tutorial_7_title"), showButtons: ["next", "close"], side: "bottom", description: t("tutorial_7_description") } },
        { element: ".react-link", skipMissingElement: true, popover: { title: t("tutorial_8_title"), description: t("tutorial_8_description") } },
        { element: ".quill-container", popover: { waitForElement: 5000, title: t("tutorial_9_title"), description: t("tutorial_9_description") } },
        { element: ".breadcrumb-item", popover: { waitForElement: 5000, title: t("tutorial_10_title"), description: t("tutorial_10_description") } },
        { element: "#feed", popover: { waitForElement: 5000, title: t("tutorial_11_title"), description: t("tutorial_11_description") } },
        { popover: { waitForElement: 5000, title: t("tutorial_12_title"), description: t("tutorial_12_description") } },
      ],

      onDestroyStarted: (element, step, { reason }) => {
        if (!isNavigating) {
          localStorage.removeItem(props.TOUR_KEY);
        }

        props.onDone();
        driverObj.destroy();
      },
    });
    const savedStep = localStorage.getItem(props.TOUR_KEY);
    if (savedStep !== null) {
      driverObj.drive(Number(savedStep));
    } else {
      driverObj.drive();
    }
    return () => driverObj.destroy();
  }, []);
}

