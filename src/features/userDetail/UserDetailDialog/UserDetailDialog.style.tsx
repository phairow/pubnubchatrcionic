import styled from "styled-components/macro";

export const UserName = styled.span`
  padding-right: ${({ theme }) => theme.space[1]};
`;

export const ScrollView = styled.section`
  text-align: left;
  overflow-y: scroll;
  > div {
    border-top: ${({ theme }) =>
      `${theme.borders.light} ${theme.colors.neutral[1]}`};
    border-bottom: ${({ theme }) =>
      `${theme.borders.light} ${theme.colors.neutral[1]}`};
  }
`;

export const CloseButton = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.normalText};
  ${({ theme }) => theme.mediaQueries.medium} {
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.space[8]} ${theme.space[3]}`};
  ${({ theme }) => theme.mediaQueries.medium} {
    padding: ${({ theme }) => theme.space[0]};
    padding-bottom: ${({ theme }) => theme.space[8]};
  }
`;

export const Title = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.backgrounds.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-family: ${({ theme }) => theme.fonts.app};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: left;
`;

export const Call = styled.div<{ isConnected: boolean }>`
  cursor: pointer;
  color: ${({ theme, isConnected }) =>
    isConnected ? theme.colors.primary[0] : theme.colors.neutral[3]};
  background: ${({ theme, isConnected }) =>
    isConnected ? theme.colors.neutral[1] : theme.colors.neutral[4]};
  border-radius: 5px;
  border: 1px solid #9b9b9b;
  padding: 12px;
`;
