"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  useEffect,
} from "react";
import {
  ActivityLog,
  Asset,
  AssetStoreAction,
  AssetStoreContextValue,
  AssetStoreState,
  TaskStatus,
  VerificationRecord,
  VerificationTask,
} from "@/types";
import {
  initialActivities,
  initialAssets,
  initialLocations,
  initialPeople,
  initialTasks,
} from "@/lib/mockData";

const STORAGE_KEY = "asset-verification-crm";

const initialState: AssetStoreState = {
  assets: initialAssets,
  people: initialPeople,
  locations: initialLocations,
  activities: initialActivities,
  tasks: initialTasks,
};

const addDays = (date: string, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value.toISOString().split("T")[0];
};

const reducer = (state: AssetStoreState, action: AssetStoreAction): AssetStoreState => {
  switch (action.type) {
    case "ADD_ASSET":
      return {
        ...state,
        assets: [action.payload, ...state.assets],
        locations: state.locations.map((location) =>
          location.id === action.payload.locationId
            ? {
                ...location,
                assetIds: location.assetIds.includes(action.payload.id)
                  ? location.assetIds
                  : [...location.assetIds, action.payload.id],
              }
            : location
        ),
      };
    case "UPDATE_ASSET":
      return {
        ...state,
        assets: state.assets.map((asset) =>
          asset.id === action.payload.id ? action.payload : asset
        ),
      };
    case "ADD_VERIFICATION": {
      const { assetId, verification } = action.payload;
      const assets = state.assets.map((asset) => {
        if (asset.id !== assetId) return asset;

        const updatedVerifications = [verification, ...asset.verifications];
        const result: Asset = {
          ...asset,
          verifications: updatedVerifications,
          lastVerified:
            verification.status === "failed"
              ? asset.lastVerified
              : verification.date,
          status:
            verification.status === "failed"
              ? "flagged"
              : verification.status === "in-progress"
              ? "pending"
              : "verified",
          nextDue:
            verification.status === "passed"
              ? addDays(verification.date, 180)
              : asset.nextDue,
        };
        return result;
      });

      return {
        ...state,
        assets,
      };
    }
    case "ADD_ACTIVITY":
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 40),
      };
    case "UPDATE_TASK_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, status: action.payload.status }
            : task
        ),
      };
    case "ADD_TASK":
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
      };
    default:
      return state;
  }
};

const initializer = (state: AssetStoreState): AssetStoreState => {
  if (typeof window === "undefined") return state;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw) as AssetStoreState;
    return {
      assets: parsed.assets?.length ? parsed.assets : state.assets,
      people: parsed.people?.length ? parsed.people : state.people,
      locations: parsed.locations?.length ? parsed.locations : state.locations,
      activities: parsed.activities?.length ? parsed.activities : state.activities,
      tasks: parsed.tasks?.length ? parsed.tasks : state.tasks,
    };
  } catch {
    return state;
  }
};

const AssetStoreContext = createContext<AssetStoreContextValue | undefined>(undefined);

export const AssetStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, initializer);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const addAsset = useCallback((asset: Asset) => {
    dispatch({ type: "ADD_ASSET", payload: asset });
  }, []);

  const updateAsset = useCallback((asset: Asset) => {
    dispatch({ type: "UPDATE_ASSET", payload: asset });
  }, []);

  const addVerification = useCallback(
    (assetId: string, verification: VerificationRecord) => {
      dispatch({ type: "ADD_VERIFICATION", payload: { assetId, verification } });
    },
    []
  );

  const addActivity = useCallback((activity: ActivityLog) => {
    dispatch({ type: "ADD_ACTIVITY", payload: activity });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    dispatch({ type: "UPDATE_TASK_STATUS", payload: { taskId, status } });
  }, []);

  const addTask = useCallback((task: VerificationTask) => {
    dispatch({ type: "ADD_TASK", payload: task });
  }, []);

  const value: AssetStoreContextValue = useMemo(
    () => ({
      ...state,
      addAsset,
      updateAsset,
      addVerification,
      addActivity,
      updateTaskStatus,
      addTask,
      isHydrated,
    }),
    [
      state,
      addAsset,
      updateAsset,
      addVerification,
      addActivity,
      updateTaskStatus,
      addTask,
      isHydrated,
    ]
  );

  return (
    <AssetStoreContext.Provider value={value}>
      {children}
    </AssetStoreContext.Provider>
  );
};

export const useAssetStore = () => {
  const context = useContext(AssetStoreContext);
  if (!context) {
    throw new Error("useAssetStore must be used within an AssetStoreProvider");
  }
  return context;
};
