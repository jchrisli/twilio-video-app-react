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
import TargetIndicator from './TargetIndicator';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/ExpansionPanel';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { styled } from '@material-ui/core';
import TurnLeft from '../../../icons/TurnLeft';
import TurnRight from '../../../icons/TurnRight';
import GoForward from '../../../icons/GoForward';
import GoBackwards from '../../../icons/GoBackwards';
import Guide from '../../../icons/Guide';
import WorkspaceArea from './WorkspaceArea';

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
  pinned: boolean;
}

interface Workspace {
  id: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    containerItem: {
      display: 'flex',
      justifyContent: 'center',
      // flexGrow:1,
      // alignItems: 'stretch',
      width: '25%',
      height: '25%',
      aspectRatio: '1',
      padding: '6px',
    },
    //guideContainter: {
    //display: 'flex',
    //justifyContent: 'center',
    //width: '100%',
    //}
  })
);

export const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  // flexGrow:1,
  // alignItems: 'stretch',

  padding: '6px',
  // resizeMode: 'contain'
  // marginRight: '0.3em',
});

export default function Map({ mapParticipantName }: MapProps) {
  const participants = useParticipants();
  const [mapParticipant, setMapParticipant] = useState<RemoteParticipant | null>(null);
  // Start with no robots
  const [robots, setRobots] = useState<Robot[]>([]);
  //const [currentRobot, setCurrentRobot] = useState<Robot | null>(null);
  const controllingRobot = useRef<Robot | null>(null);
  const onRobot = useRef<Robot | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showWorkspaces, setShowWorkspaces] = useState(true);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(-1);
  const [spotlightRobotId, setSpotlightRobotId] = useState(-1);
  const { room } = useVideoContext();
  const localName = room!.localParticipant.identity;
  //const mapRef = useRef<HTMLDivElement>(null);
  const [elemWidth, setElemWidth] = useState(0);
  const [elemHeight, setElemHeight] = useState(0);
  const [goalX, setGoalX] = useState(0);
  const [goalY, setGoalY] = useState(0);

  const classes = useStyles();
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

    sio.on('workspace-update', data => {
      //console.log(`Workspace update ${data[0]}`);
      setWorkspaces(data);
    });

    sio.on('spotlight', data => {
      let robotId = data['id'];
      let on = data['on'];
      if (on && spotlightRobotId !== robotId && robotId != -1) {
        setSpotlightRobotId(robotId);
        //setSelectedParticpantByRobotId(robotId);
      }
      if (!on) {
        setSpotlightRobotId(-1);
        // Gob back to the robot the participant control?
      }
    });
    return () => {
      sio.close();
    };
  }, []);

  useEffect(() => {
    if (spotlightRobotId === -1) {
      let i = 0;
      // Find the robot the local user is on
      for (; i < robots.length; i++) {
        if (robots[i].users.indexOf(localName) !== -1) {
          const robotId = robots[i].id;
          onRobot.current = robots[i];
          controllingRobot.current = robots[i].users[0] === localName ? robots[i] : null;
          const selectedFromRobot = participants.filter(p => p.identity === `mobile${robotId}`);
          if (selectedFromRobot.length > 0 && selectedParticipant !== selectedFromRobot[0]) {
            setSelectedParticipant(selectedFromRobot[0]);
          }
          break;
        }
      }
    } else {
      const selectedFromRobot = participants.filter(p => p.identity === `mobile${spotlightRobotId}`);
      if (selectedFromRobot.length > 0 && selectedParticipant !== selectedFromRobot[0]) {
        setSelectedParticipant(selectedFromRobot[0]);
      }
    }
  }, [participants, robots, spotlightRobotId]);

  useEffect(() => {
    // Select one based on m
  }, [workspaces]);

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
      //heading: 3.1416 / 2,
      username: localName,
      workspace: selectedWorkspaceId,
    };
    console.log(`Clicked ${clickMsg.x} ${clickMsg.y} on ${clickMsg.w} and ${clickMsg.h}`);
    sio.emit('robot-go', clickMsg);

    // Is it safe to update states in a regular callback? Does it use a stale closure?
    setGoalX(e.clientX - bb.left);
    setGoalY(e.clientY - bb.top);
  };

  const mainFrameOnMouseMove = function(e: React.MouseEvent) {
    e.preventDefault();
    const bb = e.currentTarget.getBoundingClientRect();

    // Find the closest workspace and turn it on
    const mx = e.clientX - bb.left,
      my = e.clientY - bb.top;
    let closestDist = Number.POSITIVE_INFINITY;
    let closestId = selectedWorkspaceId;
    for (let i = 0; i < workspaces.length; ++i) {
      let w = workspaces[i];
      let d = Math.hypot(
        mx - (((w.x1 + w.x2) / 1280.0) * elemWidth) / 2,
        my - (((w.y1 + w.y2) / 720.0) * elemHeight) / 2
      );
      if (d < closestDist) {
        closestDist = d;
        closestId = w.id;
      }
    }

    if (closestId !== -1 && selectedWorkspaceId !== closestId) {
      setSelectedWorkspaceId(closestId);
    }
  };

  const mainFrameOnMouseEnter = function(e: React.MouseEvent) {
    setShowWorkspaces(true);
  };

  const mainFrameOnMouseLeave = function(e: React.MouseEvent) {
    setShowWorkspaces(false);
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

  const onClickHelp = (e: React.MouseEvent) => {
    console.log('Get help');
    var successBool = navigator.vibrate(200);
  };

  const makeRCMessage = (dir: string, name: string, r: Robot) => {
    return {
      username: name,
      id: r.id,
      direction: dir,
    };
  };

  const onDirectionButtonPress = (direction: string, e: React.MouseEvent) => {
    console.log(`Go ${direction}`);
    if (controllingRobot.current !== null) {
      sio.emit('robot-rc', makeRCMessage(direction, localName, controllingRobot.current));
      console.log(`Sent message ${direction}`);
    }
  };

  const onButtonRelease = (e: React.MouseEvent) => {
    console.log('Mouse released!');
    if (controllingRobot.current !== null) {
      sio.emit('robot-rc', makeRCMessage('s', localName, controllingRobot.current));
    }
  };

  // return null if no map participant?
  return mapParticipant ? (
    <div>
      <div
        onClick={mainFrameOnClick}
        ref={measureMap}
        onMouseMove={mainFrameOnMouseMove}
        onMouseEnter={mainFrameOnMouseEnter}
        onMouseLeave={mainFrameOnMouseLeave}
        style={{ position: 'relative' }}
      >
        <ParticipantTracks participant={mapParticipant} />
        {robots.map(r => (
          <RobotAvatar
            id={r.id}
            x={(r.x / 1280.0) * elemWidth}
            y={(r.y / 720.0) * elemHeight}
            heading={r.heading}
            hasControl={r.users.length > 0 && r.users[0] === localName}
            numberUsers={r.users.length}
            on={r.users.indexOf(localName) !== -1}
            spotlighted={r.id === spotlightRobotId}
            pinned={r.pinned}
            handleClick={onClickRobot.bind(null, localName, r.id)}
            key={r.id}
          />
        ))}
        {showWorkspaces ? (
          workspaces.map(w => (
            <WorkspaceArea
              key={w.id}
              id={w.id}
              x1={(w.x1 / 1280) * elemWidth}
              x2={(w.x2 / 1280) * elemWidth}
              y1={(w.y1 / 720) * elemHeight}
              y2={(w.y2 / 720) * elemHeight}
              on={w.id === selectedWorkspaceId}
            />
          ))
        ) : (
          <></>
        )}
        <TargetIndicator x={goalX} y={goalY}></TargetIndicator>
      </div>
      <IconContainer>
        <div
          className={classes.containerItem}
          onMouseDown={onDirectionButtonPress.bind(null, 'f')}
          onMouseUp={onButtonRelease}
        >
          <GoForward />
        </div>
      </IconContainer>
      <IconContainer>
        <div
          className={classes.containerItem}
          onMouseDown={onDirectionButtonPress.bind(null, 'l')}
          onMouseUp={onButtonRelease}
        >
          <TurnLeft />
        </div>
        <div
          className={classes.containerItem}
          onMouseDown={onDirectionButtonPress.bind(null, 'b')}
          onMouseUp={onButtonRelease}
        >
          <GoBackwards />
        </div>
        <div
          className={classes.containerItem}
          onMouseDown={onDirectionButtonPress.bind(null, 'r')}
          onMouseUp={onButtonRelease}
        >
          <TurnRight />
        </div>
      </IconContainer>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>Help</AccordionSummary>
        <AccordionDetails>
          <div>
            <Guide />
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  ) : null;
}
