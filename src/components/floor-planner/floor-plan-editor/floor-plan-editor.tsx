'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { EditorToolbar } from './controls/editor-toolbar';
import { CanvasRenderer } from './canvas/canvas-renderer';
import { useDrawingMode } from './hooks/use-drawing-mode';
import { useCanvasSize } from './hooks/use-canvas-size';
import { usePanZoom } from './hooks/use-pan-zoom';
import { useSelection } from './hooks/use-selection';
import { RoomPropertiesPanel } from './controls/room-properties-panel';
import { useFloor } from '@/contexts/floor-context';
import { Toaster } from '@/components/ui/sonner';

export const DEFAULT_ROOM_COLORS = [
  '#ffadad',
  '#ffd6a5',
  '#fdffb6',
  '#caffbf',
  '#9bf6ff',
  '#a0c4ff',
  '#bdb2ff',
  '#ffc6ff',
];

export type InteractionMode = 'select' | 'drawing';
export type CanvasState = 'moving' | 'resizing' | 'none';
export type CursorClass =
  | 'cursor-default'
  | 'cursor-crosshair'
  | 'cursor-move'
  | 'cursor-grabbing';

// Consolidated editor state
interface EditorState {
  interactionMode: InteractionMode;
  canvasState: CanvasState;
  cursorStyle: CursorClass;
  selectedRoomId: string | null;
}

type EditorAction =
  | { type: 'SET_INTERACTION_MODE'; payload: InteractionMode }
  | { type: 'SET_CANVAS_STATE'; payload: CanvasState }
  | { type: 'SET_CURSOR_STYLE'; payload: CursorClass }
  | { type: 'SELECT_ROOM'; payload: string | null }
  | { type: 'START_MOVING' }
  | { type: 'START_RESIZING' }
  | { type: 'END_INTERACTION' };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_INTERACTION_MODE':
      return { ...state, interactionMode: action.payload };
    case 'SET_CANVAS_STATE':
      return { ...state, canvasState: action.payload };
    case 'SET_CURSOR_STYLE':
      return { ...state, cursorStyle: action.payload };
    case 'SELECT_ROOM':
      return { ...state, selectedRoomId: action.payload };
    case 'START_MOVING':
      return {
        ...state,
        canvasState: 'moving',
        cursorStyle: 'cursor-grabbing',
      };
    case 'START_RESIZING':
      return { ...state, canvasState: 'resizing', cursorStyle: 'cursor-move' };
    case 'END_INTERACTION':
      return { ...state, canvasState: 'none', cursorStyle: 'cursor-default' };
    default:
      return state;
  }
}

export function FloorPlanEditor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { rooms, saveFloor } = useFloor();

  const [editorState, dispatch] = useReducer(editorReducer, {
    interactionMode: 'select',
    canvasState: 'none',
    cursorStyle: 'cursor-default',
    selectedRoomId: null,
  });

  const canvasSize = useCanvasSize(containerRef);
  const { pan, zoom } = usePanZoom(
    containerRef,
    editorState.interactionMode,
    editorState.canvasState
  );

  const {
    isDrawing,
    startPoint,
    currentPoint,
    isValidPlacement,
    handlePointerDown: handleDrawingPointerDown,
    handlePointerMove: handleDrawingPointerMove,
    handlePointerUp: handleDrawingPointerUp,
  } = useDrawingMode(
    containerRef,
    editorState.interactionMode,
    pan,
    zoom,
    (cursor: CursorClass) =>
      dispatch({ type: 'SET_CURSOR_STYLE', payload: cursor })
  );

  const {
    selectedRoom,
    tempRoom,
    isMoving,
    isResizing,
    handlePointerDown: handleSelectionPointerDown,
    handlePointerMove: handleSelectionPointerMove,
    handlePointerUp: handleSelectionPointerUp,
    updateRoomProperty,
  } = useSelection(
    containerRef,
    editorState.canvasState,
    pan,
    zoom,
    editorState.selectedRoomId,
    isResizing =>
      dispatch({
        type: isResizing ? 'START_RESIZING' : 'END_INTERACTION',
      }),
    isMoving =>
      dispatch({
        type: isMoving ? 'START_MOVING' : 'END_INTERACTION',
      }),
    (roomId: string | null) =>
      dispatch({ type: 'SELECT_ROOM', payload: roomId })
  );

  // Keyboard shortcuts
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof Element)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
        return true;
      if ((target as HTMLElement).isContentEditable) return true;
      return false;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveFloor();
      } else {
        switch (event.key) {
          case 'v':
            dispatch({ type: 'SET_INTERACTION_MODE', payload: 'select' });
            break;
          case 'd':
            dispatch({ type: 'SET_INTERACTION_MODE', payload: 'drawing' });
            break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFloor]);

  // Combined event handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const handled = handleSelectionPointerDown(e);

      if (editorState.interactionMode === 'drawing' && !handled) {
        handleDrawingPointerDown(e);
      } else {
        dispatch({ type: 'SET_CURSOR_STYLE', payload: 'cursor-grabbing' });
      }
    },
    [
      editorState.interactionMode,
      handleSelectionPointerDown,
      handleDrawingPointerDown,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const handled = handleSelectionPointerMove(e);

      if (editorState.interactionMode === 'drawing' && !handled) {
        handleDrawingPointerMove(e);
      }
    },
    [
      editorState.interactionMode,
      handleSelectionPointerMove,
      handleDrawingPointerMove,
    ]
  );

  const handlePointerUp = useCallback(() => {
    handleSelectionPointerUp();
    if (editorState.interactionMode === 'drawing') {
      const newRoom = handleDrawingPointerUp();
      if (newRoom) {
        dispatch({ type: 'SELECT_ROOM', payload: newRoom.id });
        dispatch({ type: 'SET_INTERACTION_MODE', payload: 'select' });
      }
    }
    dispatch({ type: 'END_INTERACTION' });
  }, [
    editorState.interactionMode,
    handleSelectionPointerUp,
    handleDrawingPointerUp,
  ]);

  return (
    <div className="relative h-full w-full touch-none overflow-hidden">
      <Toaster />
      <main
        className={`h-full bg-muted touch-none ${editorState.cursorStyle}`}
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <CanvasRenderer
          canvasSize={canvasSize}
          pan={pan}
          zoom={zoom}
          rooms={rooms}
          isDrawing={isDrawing}
          startPoint={startPoint}
          currentPoint={currentPoint}
          isValidPlacement={isValidPlacement}
          selectedRoom={selectedRoom}
          tempRoom={tempRoom}
        />
      </main>
      <EditorToolbar
        interactionMode={editorState.interactionMode}
        onModeChange={mode =>
          dispatch({ type: 'SET_INTERACTION_MODE', payload: mode })
        }
      />
      {selectedRoom && !isMoving && !isResizing && (
        <RoomPropertiesPanel
          room={selectedRoom}
          pan={pan}
          zoom={zoom}
          onUpdateProperty={updateRoomProperty}
        />
      )}
    </div>
  );
}
