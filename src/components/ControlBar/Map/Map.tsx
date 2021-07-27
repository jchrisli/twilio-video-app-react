import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
import useSelectedParticipant from '../../VideoProvider/useSelectedParticipant/useSelectedParticipant';
//import usePublications from '../../../hooks/usePublications/usePublications';
import ParticipantTracks from '../../ParticipantTracks/ParticipantTracks';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import RobotAvatar from './RobotAvatar';

// Asteroids
import sio from '../../../connection/sio';
import { RemoteParticipant } from 'twilio-video';
import { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TargetIndicator from './TargetIndicator';

interface MapProps {
  mapParticipantName: string;
}

// This will probably be moved to something like useRobots
interface Robot {
  id: number;
  x: number;
  y: number;
  heading: number;
  users: string[]; // first user is always the controller
}

export default function Map({ mapParticipantName }: MapProps) {
  const participants = useParticipants();
  const [mapParticipant, setMapParticipant] = useState<RemoteParticipant | null>(null);
  // Start with no robots
  const [robots, setRobots] = useState<Robot[]>([]);
  const { room } = useVideoContext();
  const localName = room!.localParticipant.identity;
  //const mapRef = useRef<HTMLDivElement>(null);
  const [elemWidth, setElemWidth] = useState(0);
  const [elemHeight, setElemHeight] = useState(0);
  const [goalX, setGoalX] = useState(0);
  const [goalY, setGoalY] = useState(0);
  // TODO: find out if using this hook for the 2nd time (already used in ParticipantList) would cause issues
  const [
    selectedParticipant,
    setSelectedParticipant,
    previewParticipant,
    setPreviewParticipant,
  ] = useSelectedParticipant();

  //let mapParticipant;
  // Find the map participant based on name
  useEffect(() => {
    const mapParticpants = participants.filter(p => p.identity === mapParticipantName);
    if (participants.length > 0) {
      setMapParticipant(mapParticpants[0]);
      //console.log('Setting map participant');
    }
  }, [participants, mapParticipantName]);

  // Register Socket.io event handlers. This map component should only render once anyway
  useEffect(() => {
    sio.on('robot-update', data => {
      setRobots(data);
    });
  }, []);

  // See https://stackoverflow.com/questions/60476155/is-it-safe-to-use-ref-current-as-useeffects-dependency-when-ref-points-to-a-dom
  const measureMap = useCallback(e => {
    if (e !== null) {
      setElemWidth(e.clientWidth);
      //setElemHeight(e.clientHeight);
      setElemHeight((e.clientWidth / 16.0) * 9.0); // TODO: so this is a hack (and not accurate). Use a ResizeObserver later
      //console.log(`Setting element width and height to be ${e.clientWidth} and ${e.clientHeight}`);
    }
  }, []);

  const mainFrameOnClick = function(e: React.MouseEvent) {
    e.preventDefault();
    const bb = e.currentTarget.getBoundingClientRect();

    let clickMsg = {
      x: e.clientX - bb.left,
      y: e.clientY - bb.top,
      w: (e.currentTarget as Element).clientWidth,
      h: (e.currentTarget as Element).clientHeight,
      heading: 3.1416 / 2,
      username: localName,
    };
    console.log(`Clicked ${clickMsg.x} ${clickMsg.y} on ${clickMsg.w} and ${clickMsg.h}`);
    sio.emit('robot-go', clickMsg);

    // Is it safe to update states in a regular callback? Does it use a stale closure?
    setGoalX(e.clientX - bb.left);
    setGoalY(e.clientY - bb.top);
  };

  const onClickRobot = function(localUserName: string, robotId: number, e: React.MouseEvent) {
    console.log(`${localUserName} clicked on robot ${robotId}`);
    const selectMsg = {
      username: localName,
      id: robotId,
    };
    sio.emit('robot-select', selectMsg);

    // select the video stream the robot delivers by matching participant name (mobile<id>) and robot id
    // Would this particpant be stale value from last render run?
    const selectedFromRobot = participants.filter(p => p.identity === `mobile${robotId}`);
    if (selectedFromRobot.length > 0) {
      setSelectedParticipant(selectedFromRobot[0]);
      //console.log('Setting map participant');
    }

    e.stopPropagation(); // Prevent the event from going to the map element
  };

  // return null if no map participant?
  return mapParticipant ? (
    <div onClick={mainFrameOnClick} ref={measureMap} style={{ position: 'relative' }}>
      <ParticipantTracks participant={mapParticipant} />
      {robots.map(r => (
        <RobotAvatar
          id={r.id}
          x={(r.x / 1280.0) * elemWidth}
          y={(r.y / 720.0) * elemHeight}
          hasControl={r.users.length > 0 && r.users[0] === localName}
          numberUsers={r.users.length}
          on={r.users.indexOf(localName) !== -1}
          handleClick={onClickRobot.bind(null, localName, r.id)}
          key={r.id}
        />
      ))}
      <TargetIndicator x={goalX} y={goalY}></TargetIndicator>
    </div>
  ) : null;
}
