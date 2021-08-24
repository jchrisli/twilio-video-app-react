import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core';
import ParticipantList from '../ParticipantList/ParticipantList';
import MainParticipant from '../MainParticipant/MainParticipant';
import ControlBar from '../ControlBar/ControlBar';
import { isMobile } from '../../utils';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import Participant from '../Participant/Participant';
import { RemoteParticipant } from 'twilio-video';

import sio from '../../connection/sio';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';

export interface Robot {
  id: number;
  x: number;
  y: number;
  heading: number;
  users: string[]; // first user is always the controller, unless the bot is pinned or spotlighted
  pinned: boolean;
}

export interface Workspace {
  id: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

const useStyles = makeStyles((theme: Theme) => {
  const totalMobileSidebarHeight = `${theme.sidebarMobileHeight +
    theme.sidebarMobilePadding * 2 +
    theme.participantBorderWidth}px`;
  return {
    container: {
      position: 'relative',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: `1fr ${theme.sidebarWidth}px 400px`,
      gridTemplateRows: '100%',
      // We should not show the control bar on mobile phones (maybe the following CSS is already doing that?)
      // [theme.breakpoints.down('sm')]:
      // isMobile ? 'default' : {
      //   gridTemplateColumns: `100%`,
      //   gridTemplateRows: `calc(100% - ${totalMobileSidebarHeight}) ${totalMobileSidebarHeight}`,
      // },
    },
    containerMobile: {
      position: 'relative',
      // height: '100%',
      display: 'grid',
      justifyContent: 'center',
      // gridTemplateColumns: `repeat(auto-fit, minmax(100px, 2fr))` ,
      // gridTemplateRows: '100%',
      // columns: '2 auto',
    },
  };
});

export default function Room() {
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const classes = useStyles();

  const participants = useParticipants();
  const localName = room!.localParticipant.identity;

  // Asteroids
  const [mapParticipant, setMapParticipant] = useState<RemoteParticipant | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const controllingRobot = useRef<Robot | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [spotlightRobotId, setSpotlightRobotId] = useState(-1);
  const [focusRobotId, setFocusRobotId] = useState(-1);
  // TODO: find out if using this hook for the 2nd time (already used in ParticipantList) would cause issues
  const [
    selectedParticipant,
    setSelectedParticipant,
    previewParticipant,
    setPreviewParticipant,
  ] = useSelectedParticipant();

  // Find the map participant based on name
  useEffect(() => {
    const mapParticpants = participants.filter(p => p.identity === 'map');
    if (participants.length > 0) {
      setMapParticipant(mapParticpants[0]);
      //console.log('Setting map participant');
    }
  }, [participants]);

  // Socket.io
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

    //sio.on('help', data => {
    //console.log(`Workspace update ${data[0]}`);
    //  var successBool = navigator.vibrate(200);
    //});

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
          //onRobot.current = robots[i];
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

  const onRobotGo = (x: number, y: number, w: number, h: number, workspaceId: number) => {
    let goMessage = {
      x: x,
      y: y,
      w: w,
      h: h,
      username: localName,
      workspace: workspaceId,
    };
    sio.emit('robot-go', goMessage);
  };

  const onRobotSelect = (robotId: number) => {
    const selectMsg = {
      username: localName,
      id: robotId,
    };
    sio.emit('robot-select', selectMsg);

    //select the video stream the robot delivers by matching participant name (mobile<id>) and robot id
    // Would this particpant be stale value from last render run?
    const selectedFromRobot = participants.filter(p => p.identity === `mobile${robotId}`);
    if (selectedFromRobot.length > 0) {
      setSelectedParticipant(selectedFromRobot[0]);
      //console.log('Setting map participant');
    }
  };

  const onButtonRelease = (e: React.MouseEvent) => {
    //console.log('Mouse released!');
    if (controllingRobot.current !== null) {
      sio.emit('robot-rc', makeRCMessage('s', localName, controllingRobot.current));
    }
  };

  const onMapFocusRobotIdChange = (robotId: number) => {
    setFocusRobotId(robotId);
  };

  if (isMobile) {
    return (
      <div>
        <div className={clsx(classes.containerMobile)}>
          <ParticipantList focusRobotId={-1} robots={robots} />
        </div>
        <div style={{ borderTop: '3px solid #ffff00 ' }}></div>
        <div className={clsx(classes.containerMobile)}>
          <Participant participant={localParticipant} isLocalParticipant={true} />
        </div>
      </div>
    );
  } else {
    return (
      <div className={clsx(classes.container)}>
        <MainParticipant />
        <ParticipantList focusRobotId={focusRobotId} robots={robots} />
        <ControlBar
          robots={robots}
          workspaces={workspaces}
          spotlightRobotId={spotlightRobotId}
          mapParticipant={mapParticipant}
          rcOnBackward={onDirectionButtonPress.bind(null, 'b')}
          rcOnForward={onDirectionButtonPress.bind(null, 'f')}
          rcOnLeft={onDirectionButtonPress.bind(null, 'l')}
          rcOnRight={onDirectionButtonPress.bind(null, 'r')}
          rcOnStop={onButtonRelease}
          mapOnClickMap={onRobotGo}
          mapOnClickRobot={onRobotSelect}
          mapOnFocusRobotChange={onMapFocusRobotIdChange}
        />
      </div>
    );
  }
}
