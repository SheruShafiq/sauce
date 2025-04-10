import React, { useEffect, useState, useRef } from "react";
import { Typography, Box, Button, Link, Chip, Stack } from "@mui/material";
import InsertEmotionIcon from "@mui/icons-material/InsertEmoticon";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import {
  upVotePost,
  downVotePost,
  reportPost,
  undoUpVotePost,
  undoDownVotePost,
  undoReportPost,
  updateUser, // ensure updateUser is imported
} from "../APICalls";
import { useSnackbar } from "notistack";
import LinkIcon from "@mui/icons-material/Link";
import { TextGlitchEffect } from "./TextGlitchEffect";
function PostPreview({
  title,
  resource,
  description,
  upvotes,
  downvotes,
  reports,
  category,
  commentsCount,
  id,
  fetchPosts,
  isLoggedIn,
  deteCreated,
  upvotedByCurrentUser,
  downvotedByCurrentUser,
  reportedByCurrentUser,
  isPostAuthoredByCurrentUser,
  pageVariant,
  userData,
}) {
  const { enqueueSnackbar } = useSnackbar();

  // Local state to track the current vote and report status
  const [voteStatus, setVoteStatus] = useState("none"); // "up", "down", or "none"
  const [reported, setReported] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const descRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (descRef.current) {
      setIsOverflow(
        descRef.current.scrollHeight > descRef.current.clientHeight
      );
    }
  }, [description]);

  // Sync local state with props whenever they change
  useEffect(() => {
    if (upvotedByCurrentUser) setVoteStatus("up");
    else if (downvotedByCurrentUser) setVoteStatus("down");
    else setVoteStatus("none");

    setReported(!!reportedByCurrentUser);
  }, [upvotedByCurrentUser, downvotedByCurrentUser, reportedByCurrentUser]);

  // Helper to format the date in Reddit style.
  const formatDateRedditStyle = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds || 1} second${
        diffInSeconds === 1 ? "" : "s"
      } ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes || 1} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours || 1} hour${hours === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days || 1} day${days === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks || 1} week${weeks === 1 ? "" : "s"} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months || 1} month${months === 1 ? "" : "s"} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years || 1} year${years === 1 ? "" : "s"} ago`;
    }
  };

  const convertedDate = new Date(deteCreated);
  const formattedDate = formatDateRedditStyle(convertedDate);

  // Handle vote actions using async/await for clarity.
  const handleVote = async (type) => {
    if (!isLoggedIn) {
      enqueueSnackbar("Please log in to vote", { variant: "login" });
      return;
    }
    if (isVoting) return; // Prevent concurrent actions
    setIsVoting(true);

    try {
      if (type === "upvote") {
        if (voteStatus === "up") {
          // Undo upvote if already upvoted.
          await undoUpVotePost(
            id,
            upvotes,
            () => {
              console.log("success");
            },
            (error) => {
              console.log("failure", error);
            }
          );
          setVoteStatus("none");
          // remove post id from likedPosts if present
          const updatedUser = {
            ...userData,
            likedPosts: (userData?.likedPosts || []).filter(
              (pid) => pid !== id
            ),
          };
          updateUser(
            userData.id,
            updatedUser,
            () => {
              console.log("User update success");
            },
            (error) => {
              console.error("User update error", error);
            }
          );
        } else {
          // If a downvote exists, undo it first.
          if (voteStatus === "down") {
            await undoDownVotePost(
              id,
              downvotes,
              () => {
                console.log("success");
              },
              (error) => {
                console.log("failure", error);
              }
            );
            // Remove id from dislikedPosts.
            const updatedUser = {
              ...userData,
              dislikedPosts: userData.dislikedPosts.filter((pid) => pid !== id),
            };
            updateUser(
              userData.id,
              updatedUser,
              () => {
                console.log("User updated");
              },
              (error) => {
                console.error(error);
              }
            );
          }
          await upVotePost(
            id,
            upvotes,
            () => {
              console.log("success");
            },
            (error) => {
              console.log("failure", error);
            }
          );
          setVoteStatus("up");
          // Add id to likedPosts.
          const updatedUser = {
            ...userData,
            likedPosts: [...userData.likedPosts, id],
          };
          updateUser(
            userData.id,
            updatedUser,
            () => {
              console.log("User updated");
            },
            (error) => {
              console.error(error);
            }
          );
        }
      } else if (type === "downvote") {
        if (voteStatus === "down") {
          // If already downvoted, undo it.
          await undoDownVotePost(
            id,
            downvotes,
            () => {
              console.log("success");
            },
            (error) => {
              console.log("failure", error);
            }
          );
          setVoteStatus("none");
          // remove post id from dislikedPosts
          const updatedUser = {
            ...userData,
            dislikedPosts: userData.dislikedPosts.filter((pid) => pid !== id),
          };
          updateUser(
            userData.id,
            updatedUser,
            () => {
              console.log("User updated");
            },
            (error) => {
              console.error(error);
            }
          );
        } else {
          // If an upvote exists, undo it first.
          if (voteStatus === "up") {
            await undoUpVotePost(
              id,
              upvotes,
              () => {
                console.log("success");
              },
              (error) => {
                console.log("failure", error);
              }
            );
            // remove id from likedPosts.
            const updatedUser = {
              ...userData,
              likedPosts: userData.likedPosts.filter((pid) => pid !== id),
            };
            updateUser(
              userData.id,
              updatedUser,
              () => {
                console.log("User updated");
              },
              (error) => {
                console.error(error);
              }
            );
          }
          await downVotePost(
            id,
            downvotes,
            () => {
              console.log("success");
            },
            (error) => {
              console.log("failure", error);
            }
          );
          setVoteStatus("down");
          // Add id to dislikedPosts.
          const updatedUser = {
            ...userData,
            dislikedPosts: [...userData.dislikedPosts, id],
          };
          updateUser(
            userData.id,
            updatedUser,
            () => {
              console.log("User updated");
            },
            (error) => {
              console.error(error);
            }
          );
        }
      } else if (type === "report") {
        if (reported) {
          // Undo report if already reported.
          await undoReportPost(
            id,
            reports,
            () => {
              console.log("success");
            },
            (error) => {
              console.log("failure", error);
            }
          );
          setReported(false);
          // remove post id from reportedPosts.
          const updatedUser = {
            ...userData,
            reportedPosts: userData.reportedPosts.filter((pid) => pid !== id),
          };
          updateUser(
            userData.id,
            updatedUser,
            () => {
              console.log("User updated");
            },
            (error) => {
              console.error(error);
            }
          );
        } else {
          await reportPost(
            id,
            reports,
            () => {
              console.log("success");
            },
            (error) => {
              console.log("failure", error);
            }
          );
          setReported(true);
          // Add id to reportedPosts.
          const updatedUser = {
            ...userData,
            reportedPosts: [...userData.reportedPosts, id],
          };
          updateUser(
            userData.id,
            updatedUser,
            () => {
              console.log("User updated");
            },
            (error) => {
              console.error(error);
            }
          );
        }
      }
      // Refresh the post data after a successful action.
      fetchPosts();
    } catch (error) {
      enqueueSnackbar(`Network error on: ${type}. ${error}`, {
        variant: "error",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const formattedResource =
    resource?.length > 20 ? `${resource.slice(0, 20)}...` : resource;

  return (
    <Stack
      gap={1}
      width={"100%"}
      // className={isPostAuthoredByCurrentUser ? "neonBorder" : "standardBorder"}
      className={pageVariant ? "" : "standardBorder"}
      py={2}
      px={pageVariant ? 0 : 2}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Link href={`posts/${id}`} target="_blank">
          <Typography fontSize={16} fontWeight="bold">
            {title}
          </Typography>
        </Link>
        <Chip size="small" label={formattedDate} variant="outlined" />
        {isPostAuthoredByCurrentUser && (
          <Chip
            size="small"
            label="Your Post"
            variant="outlined"
            color="success"
          />
        )}
      </Stack>
      <Box>
        <Stack gap={1}>
          <Link href={resource} target="_blank">
            <Stack
              gap={1}
              width={"fit-content"}
              px={1}
              flexDirection={"row"}
              sx={{
                backgroundColor: "#ffffff21",
                borderRadius: "5px",
              }}
            >
              <LinkIcon />
              <TextGlitchEffect
                text={formattedResource}
                speed={40}
                letterCase="lowercase"
                className="resourceLink"
                type="alphanumeric"
              />
            </Stack>
          </Link>

          <Box
            sx={{
              position: "relative",
              maxHeight: pageVariant ? "100%" : "100px",
              overflow: "hidden",
            }}
            ref={descRef}
          >
            <Typography>{description}</Typography>
            {isOverflow && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "100px",
                  background: "linear-gradient(transparent, black)",
                }}
              />
            )}
          </Box>
        </Stack>
        <Button
          onClick={() => handleVote("upvote")}
          disabled={isVoting}
          startIcon={
            <InsertEmotionIcon
              color={voteStatus === "up" ? "success" : "inherit"}
            />
          }
        >
          {upvotes}
        </Button>
        <Button
          onClick={() => handleVote("downvote")}
          disabled={isVoting}
          startIcon={
            <SentimentVeryDissatisfiedIcon
              color={voteStatus === "down" ? "error" : "inherit"}
            />
          }
        >
          {downvotes}
        </Button>
        <Button
          onClick={() => handleVote("report")}
          disabled={isVoting}
          startIcon={
            <ErrorOutlinedIcon color={reported ? "warning" : "inherit"} />
          }
        >
          {reports}
        </Button>
        <Button>{category}</Button>
        <Button startIcon={<MessageOutlinedIcon color="secondary" />}>
          {commentsCount}
        </Button>
      </Box>
    </Stack>
  );
}

export default PostPreview;
