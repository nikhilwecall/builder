/** @jsx jsx */
import React from "react";
import { jsx } from "@emotion/react";
import appState from "@builder.io/app-context";
import { Modal, Login, CompactView } from "@bynder/compact-view";
import {
  Button,
  Paper,
  Tooltip,
  IconButton,
  Typography,
} from "@material-ui/core";
import { IconCloudUpload } from "@tabler/icons-react";
import { Close } from "@material-ui/icons";
import {
  fastClone,
  BYNDER_LANGUAGE,
  BYNDER_URL,
  ASSET_FIELD_SELECTION,
  SHOW_ASSET_FIELD_SELECTION,
  pluginId,
} from "./utils";
import { partial } from "filesize";
const filesize = partial({ standard: "jedec" });

// TODO: convert to TS
/**
 * @typedef {"MultiSelect" | "SingleSelect" | "SingleSelectFile"} SelectType
 *
 * @typedef {Object} BynderCompactViewProps
 * @property {any} value - The title of the component.
 * @property {function} onChange - The count to display.
 * @property {SelectType} mode - Whether the component is active.
 */

/**
 * A React Component to show the Bynder Universal Compact View compoonent and handle responses
 * @param {BynderCompactViewProps} props - The props of the component.
 * @returns {JSX.Element} The rendered component.
 */
export const BynderCompactView = (props) => {
  const { value, onChange, mode, assetTypes, context } = props;
  const [isOpen, setIsOpen] = React.useState(false);

  // The type of `value` is a MobX proxy object. Convert back to a usable object.
  // Keep a local state value because onChange does not trigger a re-render with a new value object.
  const [internalValue, setInternalValue] = React.useState(fastClone(value));

  const onChangeWrapper = (val) => {
    onChange(val);
    setInternalValue(val);
  };

  const onSuccess = (assets, additionalInfo) => {
    // TODO: What do we do with additionalInfo? Only used with mode === "SingleSelectFile"
    if (mode === "SingleSelect") {
      onChangeWrapper(assets[0]);
    } else {
      onChangeWrapper(assets);
    }
    setIsOpen(false); // Why do we have to do this?
  };

  const selectedAssets = React.useMemo(() => {
    if (mode === "SingleSelect") {
      return internalValue?.id ? [internalValue?.id] : [];
    }
    return internalValue?.length ? internalValue.map((asset) => asset.id) : [];
  }, [internalValue, mode]);

  // Get the saved Bynder URL from the plugin settings
  const pluginSettings =
    appState.user.organization.value.settings.plugins?.get(pluginId);
  const url = pluginSettings?.get(BYNDER_URL);
  const language = pluginSettings?.get(BYNDER_LANGUAGE);

  const bynderProps = {
    onSuccess,
    language: language ?? supportedLanguages[0],
    mode,
    // assetTypes, // this was breaking for some reason
    selectedAssets,
  };
  if (pluginSettings?.get(SHOW_ASSET_FIELD_SELECTION)) {
    bynderProps.assetFieldSelection = pluginSettings?.get(
      ASSET_FIELD_SELECTION
    );
  }

  return (
    <div>
      {/* TODO:  show the # of selected items if multi-select? Previews as Chips/list instead? */}
      {mode === "MultiSelect" && (
        <div
          css={{
            display: "flex",
            alignItems: "left",
            alignContent: "center",
            border: `1px solid ${context.theme.colors.border}`,
            borderRadius: 4,
            padding: 8,
          }}
        >
          {selectedAssets.length > 0 && (
            <div css={{ flexGrow: 1 }}>
              <ul css={{ textAlign: "left" }}>
                {internalValue.map((asset) => (
                  <li>{asset.name}</li>
                ))}
              </ul>
            </div>
          )}
          <Button
            onClick={() => setIsOpen(true)}
            variant="contained"
            color="primary"
          >
            {selectedAssets.length
              ? "Change Selection"
              : "Select Bynder Assets"}
          </Button>
        </div>
      )}

      {mode === "SingleSelect" && (
        <RenderSinglePreview
          asset={internalValue}
          onClick={() => setIsOpen(true)}
          onChange={onChangeWrapper}
          context={context}
        />
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Login portal={{ url, editable: true, language: bynderProps.language }}>
          <CompactView {...bynderProps} />
        </Login>
      </Modal>
    </div>
  );
};

const RenderSinglePreview = ({
  asset,
  additionalInfo, // TODO: Find a way to incorporate this for "SingleSelect" inputs?
  onClick,
  onChange,
  context,
}) => {
  const theme = context.theme;

  const fileName = asset && `${asset?.name}.${asset.extensions[0]}`;

  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        "&:hover .close-button": { display: "flex" },
        position: "relative",
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 4,
        padding: 8,
      }}
    >
      {asset ? (
        <div
          css={{
            position: "relative",
            "&:hover .close-button": { opacity: 1 },
          }}
        >
          <div
            css={{
              height: "auto",
              cursor: "pointer",
            }}
            onClick={() => window.open(asset.files.webImage.url, "_blank")}
          >
            <Paper
              css={{
                display: "inline-block",
                fontSize: 0,
                marginTop: 3,
                overflow: "hidden",
                "&:hover": {
                  border: `1px solid ${theme.colors.primary}`,
                },
              }}
            >
              <img
                key={asset.id}
                onContextMenu={(e) => {
                  // Allow normal context menu on right click so people can "copy image url",
                  // don't propagate to the blocking custom context menu
                  e.stopPropagation();
                }}
                css={{
                  width: 64,
                  height: 64,
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                src={asset.files.thumbnail.url}
                // TODO: Error handling?
                onError={(error) => {}}
              />
            </Paper>
          </div>
        </div>
      ) : (
        <div
          css={{
            padding: 20,
            borderRadius: 4,
            backgroundColor: theme.colors.bgSecondary,
          }}
        >
          <IconCloudUpload
            css={{
              color: theme.colors.border,
            }}
          />
        </div>
      )}

      {asset && (
        <Tooltip title={`Remove asset`}>
          <IconButton
            className="close-button"
            component="label"
            css={{
              position: "absolute",
              top: 4,
              right: 4,
              display: "none",
              padding: 4,
            }}
            onClick={() => {
              onChange(null);
            }}
          >
            <Close css={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {fileName && (
          <>
            <div>
              <Typography
                title={asset.name}
                css={{
                  fontSize: 12,
                  color: theme.colors.text.regular,
                  marginLeft: 8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  display: "inline-block",
                  textOverflow: "ellipsis",
                  "&:hover": {
                    textDecoration: "underline",
                    cursor: "pointer",
                  },
                }}
              >
                <a href={asset.files.webImage.url} target="_blank"></a>
                {fileName}
              </Typography>
            </div>
            {asset.files.webImage.fileSize && (
              <div>
                <Typography
                  css={{
                    fontSize: 12,
                    color: "var(--text-caption)",
                    marginLeft: 8,
                  }}
                >
                  {filesize(asset.files.webImage.fileSize)}
                </Typography>
              </div>
            )}
          </>
        )}
        <div css={{ width: "100%" }}>
          <Button
            color="primary"
            onClick={onClick}
            css={{
              marginLeft: 8,
              ...(fileName && {
                padding: "0 5px",
                fontSize: 12,
              }),
            }}
          >
            {`${asset ? "Change" : "Choose"} Bynder Asset`}
          </Button>
        </div>
      </div>
    </div>
  );
};
