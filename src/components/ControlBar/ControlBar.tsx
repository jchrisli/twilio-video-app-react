import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import Map from './Map/Map';
import { Robot, Workspace } from '../Room/Room';
import RC from './RC';
import Accordion from '@material-ui/core/ExpansionPanel';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Guide from '../../icons/Guide';
import { RemoteParticipant } from 'twilio-video';

interface ControlBarProps {
  robots: Robot[];
  workspaces: Workspace[];
  spotlightRobotId: number;
  rcOnForward: (e: React.MouseEvent) => void;
  rcOnBackward: (e: React.MouseEvent) => void;
  rcOnLeft: (e: React.MouseEvent) => void;
  rcOnRight: (e: React.MouseEvent) => void;
  rcOnStop: (e: React.MouseEvent) => void;
  rcOnHelp: (e: React.MouseEvent) => void;
  mapOnClickMap: (x: number, y: number, w: number, h: number, workspaceId: number) => void;
  mapOnClickRobot: (robotId: number) => void;
  mapParticipant: RemoteParticipant | null;
  mapOnFocusRobotChange: (robotId: number) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    controlBarContainer: {
      gridArea: '1 / 3 / 1 / 4',
      background: '#FFFFFF',
      zIndex: 9,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #E4E7E9',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
      },
    },
    // Do not hide for now
    // hide: {
    //   display: 'none',
    // },
  })
);

export default function ControlBar(props: ControlBarProps) {
  const classes = useStyles();

  return (
    <aside className={clsx(classes.controlBarContainer)}>
      <Map
        mapParticipant={props.mapParticipant}
        robots={props.robots}
        workspaces={props.workspaces}
        spotlightRobotId={props.spotlightRobotId}
        onClickMap={props.mapOnClickMap}
        onClickRobot={props.mapOnClickRobot}
        onFocusRobotChange={props.mapOnFocusRobotChange}
      />
      <RC
        onLeft={props.rcOnLeft}
        onForward={props.rcOnForward}
        onBackward={props.rcOnBackward}
        onRight={props.rcOnRight}
        onStop={props.rcOnStop}
        onHelp={props.rcOnStop}
      ></RC>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>Help</AccordionSummary>
        <AccordionDetails>
          <div>
            <Guide />
          </div>
        </AccordionDetails>
      </Accordion>
    </aside>
  );
}
