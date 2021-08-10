import React from 'react';
import clsx from 'clsx';
import Participant from '../Participant/Participant';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import { isMobile } from '../../utils';
import { isClassExpression } from 'typescript';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      overflowY: 'auto',
      background: 'rgb(79, 83, 85)',
      gridArea: '1 / 2 / 1 / 3',
      zIndex: 5,
      [theme.breakpoints.down('sm')]: {
        gridArea: '2 / 1 / 3 / 3',
        overflowY: 'initial',
        overflowX: 'auto',
        display: 'flex',
      },
    },
    transparentBackground: {
      background: 'transparent',
    },
    superContainer: {
      [theme.breakpoints.down('sm')]: {
        display: isMobile ? 'flex' : `default`,
        flexDirection: 'column-reverse',
        justifyContent: 'flex-end',
      },
    },
    scrollContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    localContainer: {
      display: isMobile ? 'flex' : 'none',
      justifyContent: 'center',
      padding: '4px',
    },
    innerScrollContainer: {
      width: isMobile ? `calc(${theme.sidebarWidth}px)` : `calc(${theme.sidebarWidth}px - 3em)`,
      padding: isMobile ? '0px' : '1.5em 0',
      [theme.breakpoints.down('sm')]: {
        width: 'auto',
        padding: isMobile ? '0px' : `${theme.sidebarMobilePadding}px`,
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : `default`,
        justifyContent: 'center',
      },
      columns: isMobile ? '2 auto' : 'default',
    },
    containerItem: {
      padding: isMobile ? '0px' : `default`,
    },
  })
);

export default function ParticipantList() {
  const classes = useStyles();
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const participants = useParticipants();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const mainParticipant = useMainParticipant();
  const isRemoteParticipantScreenSharing = false;

  if (participants.length === 1) return null; // Don't render this component if there are no remote participants.

  return (
    <aside
      className={clsx(classes.container, {
        [classes.transparentBackground]: !isRemoteParticipantScreenSharing,
      })}
    >
      <div className={classes.superContainer}>
        <div className={classes.localContainer}>
          <Participant participant={localParticipant} isLocalParticipant={true} />
        </div>
        <div
          className={classes.localContainer}
          style={{ borderTop: '2px solid #ffff00 ', marginLeft: 20, marginRight: 20 }}
        ></div>
        <div className={classes.scrollContainer}>
          <div className={classes.innerScrollContainer}>
            {participants.map(participant => {
              const isSelected = participant === selectedParticipant;
              const display =
                (isMobile && !participant.identity.startsWith('mobile')) ||
                (!isMobile && participant.identity.startsWith('mobile'));
              if (display) {
                return (
                  <div className={classes.containerItem}>
                    <Participant
                      key={participant.sid}
                      participant={participant}
                      isSelected={participant === selectedParticipant}
                      onClick={() => setSelectedParticipant(participant)}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
