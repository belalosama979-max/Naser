/**
 * gameStore.js
 * Zustand global state with full persistence (localStorage).
 * Manages: students, points, cards, settings, seasons, audit log.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { pathsData } from '../utils/pathsData';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// ─── Custom Firebase Storage Adapter ──────────────────────────
const DB_DOC_REF = doc(db, 'gameData', 'mainStore');

let isSyncing = false;
export let currentTimestamp = Date.now();

const CHUNK_SIZE = 800000;

const saveToFirebase = async (parsedObj, jsonString) => {
  const numChunks = Math.ceil(jsonString.length / CHUNK_SIZE);
  if (numChunks === 1 && jsonString.length < CHUNK_SIZE) {
    await setDoc(DB_DOC_REF, parsedObj);
  } else {
    const chunkPromises = [];
    for (let i = 0; i < numChunks; i++) {
      const chunkData = jsonString.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      chunkPromises.push(setDoc(doc(db, 'gameData', `mainStore_chunk_${i}`), { data: chunkData }));
    }
    await Promise.all(chunkPromises);
    await setDoc(DB_DOC_REF, {
      _timestamp: parsedObj._timestamp,
      chunks: numChunks
    });
  }
};

const firebaseStorage = {
  getItem: async (name) => {
    const localDataStr = localStorage.getItem(name);
    let firebaseDataStr = null;

    try {
      const docSnap = await getDoc(DB_DOC_REF);
      if (docSnap.exists()) {
        const meta = docSnap.data();
        if (meta.state) {
          firebaseDataStr = JSON.stringify(meta);
        } else if (meta.chunks) {
          let fullStr = '';
          for (let i = 0; i < meta.chunks; i++) {
            const chunkSnap = await getDoc(doc(db, 'gameData', `mainStore_chunk_${i}`));
            if (chunkSnap.exists()) fullStr += chunkSnap.data().data;
          }
          firebaseDataStr = fullStr;
        }
      }
    } catch (e) {
      console.error("Firebase read error:", e);
      return localDataStr; // Fallback to local on error
    }

    if (!firebaseDataStr && !localDataStr) return null;

    let fbTime = 0;
    let localTime = 0;
    let parsedFb = null;
    let parsedLocal = null;

    if (firebaseDataStr) {
       try { parsedFb = JSON.parse(firebaseDataStr); fbTime = parsedFb._timestamp || 0; } catch(e){}
    }
    if (localDataStr) {
       try { parsedLocal = JSON.parse(localDataStr); localTime = parsedLocal._timestamp || 0; } catch(e){}
    }

    // Determine the newest data
    if (fbTime > localTime) {
      currentTimestamp = fbTime;
      localStorage.setItem(name, firebaseDataStr);
      return firebaseDataStr;
    } else if (localTime > fbTime) {
      currentTimestamp = localTime;
      if (parsedLocal) saveToFirebase(parsedLocal, localDataStr).catch(() => {});
      return localDataStr;
    }

    // Equal timestamps or parsing failed
    return localDataStr || firebaseDataStr;
  },
  setItem: async (name, value) => {
    try {
      const parsed = JSON.parse(value);

      if (isSyncing) {
        // Triggered by onSnapshot: only save locally, avoid infinite loop
        parsed._timestamp = currentTimestamp;
        localStorage.setItem(name, JSON.stringify(parsed));
        isSyncing = false;
        return;
      }

      // Normal UI update
      currentTimestamp = Date.now();
      parsed._timestamp = currentTimestamp;
      const newValue = JSON.stringify(parsed);
      
      // Save locally INSTANTLY
      localStorage.setItem(name, newValue);
      
      // Fire and forget to Firebase (chunked to bypass 1MB limit)
      saveToFirebase(parsed, newValue).catch(e => console.error("Firebase chunk write error:", e));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  removeItem: async (name) => {
    localStorage.removeItem(name);
  }
};

// Function to set isSyncing flag from outside
export const setSyncing = (state) => {
  isSyncing = state;
};

// ─── Initial State ────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 's_1', name: 'أوس غياضة', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 1, previousRank: 1, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_2', name: 'يمان محمد الهيجاوي', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 2, previousRank: 2, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_3', name: 'يحيى محمد سريحي', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 3, previousRank: 3, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_4', name: 'كرم محمد الناطور', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 4, previousRank: 4, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_5', name: 'عمر زكريا العوامرة', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 5, previousRank: 5, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_6', name: 'قصي محمد البياري', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 6, previousRank: 6, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_7', name: 'معتز إياد الطويل', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 7, previousRank: 7, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_8', name: 'عمر عيسى التميمي', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 8, previousRank: 8, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_9', name: 'محمد رائد المستريحي', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 9, previousRank: 9, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_10', name: 'محمود طقاطق', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 10, previousRank: 10, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_11', name: 'أيهم ناصر', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 11, previousRank: 11, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_12', name: 'فارس أسعد', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 12, previousRank: 12, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_13', name: 'يزن بلعاوي', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 13, previousRank: 13, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_14', name: 'مصطفى العنتري', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 14, previousRank: 14, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_15', name: 'ليث بيوض', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 15, previousRank: 15, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_16', name: 'حمزة محمود مراد', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 16, previousRank: 16, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_17', name: 'سهيل محمد القريبي', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 17, previousRank: 17, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_18', name: 'محمد الهباهبة', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 18, previousRank: 18, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_19', name: 'ابراهيم الهباهبة', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 19, previousRank: 19, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_20', name: 'يوسف السطري', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 20, previousRank: 20, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_21', name: 'محمد السطري', avatar: '', pathId: 'path1', points: 0, progress: 0, currentRank: 21, previousRank: 21, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
  { id: 's_22', name: 'محمد شموط', avatar: '', pathId: 'path2', points: 0, progress: 0, currentRank: 22, previousRank: 22, hasJerusalemBadge: false, joinedAt: new Date().toISOString(), cardHistory: [] },
];

const MOCK_AUDIT = [];

const INITIAL_STATE = {
  settings: {
    targetPoints: 1000,
    gameName: 'موسم فتح القدس الأول',
    academicYear: '2025 - 2026',
    displayMode: 'game', // 'game' | 'admin'
    theme: 'dark',
    // نقاط المحطات — قابلة للتعديل من لوحة الإدارة
    nodePoints: {
      // المسار العراقي
      p1_1: 0,    // البصرة
      p1_2: 50,   // منطقة الأبلة
      p1_3: 100,  // الكوفة
      p1_4: 150,  // منطقة القادسية
      p1_5: 200,  // بغداد
      p1_6: 250,  // منطقة النهروان
      p1_7: 300,  // تكريت
      p1_8: 350,  // منطقة سامراء
      p1_9: 400,  // الموصل
      p1_10: 450, // منطقة سنجار
      p1_11: 500, // حلب
      p1_12: 550, // منطقة جبل سمعان
      p1_13: 600, // دمشق
      p1_14: 650, // منطقة الغوطة
      // المسار الشامي
      p2_1: 0,    // صور
      p2_2: 50,   // منطقة رأس العين
      p2_3: 100,  // عكا
      p2_4: 150,  // منطقة وادي الصليب
      p2_5: 200,  // حيفا
      p2_6: 250,  // منطقة جبل الكرمل
      p2_7: 300,  // نابلس
      p2_8: 350,  // منطقة بلاطة
      p2_9: 400,  // الرملة
      p2_10: 450, // منطقة اللطرون
      p2_11: 500, // اللد
      p2_12: 550, // منطقة بيت نبالا
      p2_13: 600, // عسقلان
      p2_14: 650, // منطقة المجدل
      dest: 1000, // القدس
    },
  },
  activeSeasonId: 's_default',
  seasons: {
    s_default: {
      id: 's_default',
      name: 'موسم فتح القدس الأول',
      status: 'active',
      createdAt: new Date().toISOString(),
      students: MOCK_STUDENTS,
      auditLog: MOCK_AUDIT,
    },
  },
  hallOfFame: [],
};

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Recalculate ranks for all students (descending by points).
 * Preserves previousRank before updating.
 */
const recalculateRanks = (students) => {
  const sorted = [...students].sort((a, b) => b.points - a.points);
  return sorted.map((student, index) => ({
    ...student,
    previousRank: student.currentRank ?? index + 1,
    currentRank: index + 1,
  }));
};

/**
 * Compute progress percentage from points.
 * Returns a float with 2 decimal places clamped to [0, 100].
 */
const computeProgress = (points, targetPoints) => {
  if (!targetPoints || targetPoints <= 0) return 0;
  const raw = (points / targetPoints) * 100;
  return Math.min(Math.max(parseFloat(raw.toFixed(2)), 0), 100);
};

// ─── Store Definition ─────────────────────────────────────────
export const useGameStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── Settings ──────────────────────────────────────────

      /** Update one or more settings fields */
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      /** Update points required for a specific node */
      updateNodePoints: (nodeId, points) =>
        set((state) => ({
          settings: {
            ...state.settings,
            nodePoints: {
              ...state.settings.nodePoints,
              [nodeId]: Math.max(0, parseInt(points) || 0),
            },
          },
        })),

      /** Bulk update all node points */
      updateAllNodePoints: (nodePointsObj) =>
        set((state) => ({
          settings: {
            ...state.settings,
            nodePoints: { ...state.settings.nodePoints, ...nodePointsObj },
          },
        })),

      /** Recompute all students' progress when targetPoints changes */
      updateTargetPoints: (newTarget) =>
        set((state) => {
          const target = Math.max(1, parseInt(newTarget) || 1000);
          const season = state.seasons[state.activeSeasonId];
          const updatedStudents = recalculateRanks(
            season.students.map((s) => ({
              ...s,
              progress: computeProgress(s.points, target),
              hasJerusalemBadge: computeProgress(s.points, target) >= 100,
            }))
          );
          return {
            settings: { ...state.settings, targetPoints: target },
            seasons: {
              ...state.seasons,
              [state.activeSeasonId]: { ...season, students: updatedStudents },
            },
          };
        }),

      /** Toggle between 'game' and 'admin' display modes */
      toggleDisplayMode: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            displayMode:
              state.settings.displayMode === 'game' ? 'admin' : 'game',
          },
        })),

      /** Toggle between light and dark theme */
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
          try {
            if (newTheme === 'light') {
              document.body.classList.add('light-theme');
            } else {
              document.body.classList.remove('light-theme');
            }
          } catch (e) {
            console.error('Failed to update body theme class', e);
          }
          return {
            settings: { ...state.settings, theme: newTheme }
          };
        }),

      // ── Student Management ─────────────────────────────────

      /** Add a new student to the active season */
      addStudent: (studentData) =>
        set((state) => {
          const season = state.seasons[state.activeSeasonId];
          const newStudent = {
            id: uuidv4(),
            name: studentData.name.trim(),
            avatar: studentData.avatar || '',   // Base64 DataURL
            pathId: studentData.pathId || 'path1',
            points: 0,
            progress: 0,
            currentRank: season.students.length + 1,
            previousRank: season.students.length + 1,
            hasJerusalemBadge: false,
            joinedAt: new Date().toISOString(),
            cardHistory: [],
          };
          const updatedStudents = recalculateRanks([...season.students, newStudent]);
          return {
            seasons: {
              ...state.seasons,
              [state.activeSeasonId]: { ...season, students: updatedStudents },
            },
          };
        }),

      /** Delete a student by ID */
      deleteStudent: (studentId) =>
        set((state) => {
          const season = state.seasons[state.activeSeasonId];
          const updatedStudents = recalculateRanks(
            season.students.filter((s) => s.id !== studentId)
          );
          return {
            seasons: {
              ...state.seasons,
              [state.activeSeasonId]: { ...season, students: updatedStudents },
            },
          };
        }),

      /** Update student fields (name, avatar, pathId) */
      updateStudent: (studentId, data) =>
        set((state) => {
          const season = state.seasons[state.activeSeasonId];
          const updatedStudents = recalculateRanks(
            season.students.map((s) =>
              s.id === studentId ? { ...s, ...data } : s
            )
          );
          return {
            seasons: {
              ...state.seasons,
              [state.activeSeasonId]: { ...season, students: updatedStudents },
            },
          };
        }),

      // ── Points Management ──────────────────────────────────

      /**
       * Add (or deduct) points to a student.
       * Supports positive and negative values.
       *
       * @param {string} studentId
       * @param {number} pointsDelta - Can be positive or negative
       * @param {string} cardType    - 'دوام' | 'متابعات' | 'مهام'
       * @param {string} adminName   - Who made the change
       */
      addPoints: (studentId, pointsDelta, cardType = 'دوام', adminName = 'المشرف') =>
        set((state) => {
          const season = state.seasons[state.activeSeasonId];
          const targetPoints = state.settings.targetPoints;

          // Build audit log entry
          const logEntry = {
            id: uuidv4(),
            studentId,
            studentName:
              season.students.find((s) => s.id === studentId)?.name || 'غير معروف',
            cardType,
            adminName,
            pointsDelta,
            timestamp: new Date().toISOString(),
          };

          const updatedStudents = recalculateRanks(
            season.students.map((s) => {
              if (s.id !== studentId) return s;

              const newPoints = Math.max(0, s.points + pointsDelta);
              const newProgress = computeProgress(newPoints, targetPoints);
              const hasJerusalemBadge = newProgress >= 100;

              const cardHistoryEntry = {
                id: uuidv4(),
                cardType,
                pointsDelta,
                timestamp: new Date().toISOString(),
              };

              return {
                ...s,
                points: newPoints,
                progress: newProgress,
                hasJerusalemBadge,
                cardHistory: [cardHistoryEntry, ...(s.cardHistory || [])].slice(0, 50),
              };
            })
          );

          return {
            seasons: {
              ...state.seasons,
              [state.activeSeasonId]: {
                ...season,
                students: updatedStudents,
                auditLog: [logEntry, ...season.auditLog].slice(0, 200),
              },
            },
          };
        }),

      /** Undo a specific audit log action */
      undoAction: (logId) =>
        set((state) => {
          const season = state.seasons[state.activeSeasonId];
          const logEntry = season.auditLog.find(l => l.id === logId);
          if (!logEntry) return state;

          const targetPoints = state.settings.targetPoints;

          const updatedStudents = recalculateRanks(
            season.students.map((s) => {
              if (s.id !== logEntry.studentId) return s;

              const newPoints = Math.max(0, s.points - logEntry.pointsDelta);
              const newProgress = computeProgress(newPoints, targetPoints);
              const hasJerusalemBadge = newProgress >= 100;

              return {
                ...s,
                points: newPoints,
                progress: newProgress,
                hasJerusalemBadge,
              };
            })
          );

          return {
            seasons: {
              ...state.seasons,
              [state.activeSeasonId]: {
                ...season,
                students: updatedStudents,
                auditLog: season.auditLog.filter(l => l.id !== logId),
              },
            },
          };
        }),

      // ── Season Management ──────────────────────────────────

      /** Create a new season and set it as active */
      createSeason: (name) =>
        set((state) => {
          const newId = `s_${uuidv4()}`;
          return {
            seasons: {
              ...state.seasons,
              [newId]: {
                id: newId,
                name,
                status: 'active',
                createdAt: new Date().toISOString(),
                students: [],
                auditLog: [],
              },
            },
            activeSeasonId: newId,
          };
        }),

      /** Archive a season and add its top 3 to Hall of Fame */
      archiveSeason: (seasonId) =>
        set((state) => {
          const season = state.seasons[seasonId];
          if (!season) return state;

          const winners = [...season.students]
            .sort((a, b) => b.points - a.points)
            .slice(0, 3)
            .map((s, idx) => ({
              rank: idx + 1,
              id: s.id,
              name: s.name,
              avatar: s.avatar,
              points: s.points,
              progress: s.progress,
              pathId: s.pathId,
            }));

          const fameEntry = {
            seasonId: season.id,
            seasonName: season.name,
            archivedAt: new Date().toISOString(),
            winners,
          };

          return {
            seasons: {
              ...state.seasons,
              [seasonId]: { ...season, status: 'archived' },
            },
            hallOfFame: [fameEntry, ...state.hallOfFame],
          };
        }),

      /** Switch the active season */
      setActiveSeason: (seasonId) => set({ activeSeasonId: seasonId }),

      // ── Computed Helpers (called inline) ──────────────────

      /** Get active season */
      getActiveSeason: () => {
        const state = get();
        return state.seasons[state.activeSeasonId];
      },

      /** Get students sorted by rank */
      getSortedStudents: () => {
        const state = get();
        const season = state.seasons[state.activeSeasonId];
        return (season?.students || []).slice().sort((a, b) => a.currentRank - b.currentRank);
      },

      // ── Reset ─────────────────────────────────────────────

      /** Clear all data and reset to initial state */
      resetGame: () => set(INITIAL_STATE),
    }),
    {
      name: 'salah-eddine-storage',
      storage: createJSONStorage(() => firebaseStorage),
    }
  )
);

// ─── Real-time Multiplayer Sync ───────────────────────────────
onSnapshot(DB_DOC_REF, async (docSnap) => {
  if (docSnap.exists()) {
    const meta = docSnap.data();
    const fbTime = meta._timestamp || 0;
    
    // If Firebase has newer state, apply it to the Zustand store
    if (fbTime > currentTimestamp) {
      setSyncing(true);
      currentTimestamp = fbTime;
      
      let dataToSet = null;
      if (meta.state) {
        dataToSet = meta.state;
      } else if (meta.chunks) {
        let fullStr = '';
        for (let i = 0; i < meta.chunks; i++) {
          const chunkSnap = await getDoc(doc(db, 'gameData', `mainStore_chunk_${i}`));
          if (chunkSnap.exists()) fullStr += chunkSnap.data().data;
        }
        try {
          const parsed = JSON.parse(fullStr);
          dataToSet = parsed.state;
        } catch(e) {
          console.error("Chunk parse error", e);
        }
      }
      
      if (dataToSet) {
        useGameStore.setState(dataToSet);
      } else {
        setSyncing(false); // Reset if data.state doesn't exist to prevent getting stuck
      }
    }
  }
});
