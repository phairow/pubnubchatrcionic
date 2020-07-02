import styled from "styled-components/macro";

export const Wrapper = styled.div<{ displayed: boolean }>`
  resize: both;
  overflow: auto;
  z-index: 1000;
  margin-top: 40px;
  position: fixed;
  background: grey;
  color: white;
  line-height: normal;
  display: ${({ theme, displayed }) => (displayed ? "flex" : "none")};
  flex-direction: column;
`;

export const VideoWrapper = styled.div``;

export const CloseButton = styled.div`
  margin-top: 2px;
  margin-right: 2px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.normalText};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.neutral[3]};
`;

export const Body = styled.div``;

export const Title = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.backgrounds.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-family: ${({ theme }) => theme.fonts.app};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: left;
`;

export const LocalVideoWrapper = styled.div`
  padding-right: 20px;
  padding-left: 10px;
  padding-top: 20px;
  float: right;
  display: inline-block;
`;

export const RemoteVideoWrapper = styled.div`
  padding-left: 20px;
  padding-right: 10px;
  padding-top: 20px;
  float: left;
  display: inline-block;
`;

export const MyVideo = styled.video`
  object-fit: cover;
  width: 169px;
  height: 90px;
`;

export const RemoteVideo = styled.video`
  object-fit: cover;
  width: 334px;
  height: 180px;
`;

export const CallStatus = styled.div`
  padding: 5px;
  margin-top: 20px;
  border-top-style: solid;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.neutral[3]};
`;
