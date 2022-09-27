import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { Card, Descriptions, Loading } from '@kubed/components';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Select } from '@kubed/icons';
import { request } from '@ks-console/shared';

export const DetailWrapper = styled.div`
  padding-top: 68px;
  min-width: 1164px;
`;

export const ASide = styled.div`
  position: fixed;
  top: 88px;
  left: 20px;
  width: 564px;
  min-width: 360px;
  padding-right: 16px;
  height: calc(100vh - 100px);
  overflow: auto;
`;

export const BaseInfo = styled.div`
  background-color: #f9fbfd;
  background-image: url(/assets/detail-info.svg);
  background-repeat: no-repeat;
  background-size: 100% auto;
  border-radius: 4px 4px 0 0;
  padding: 12px;

  .back-link {
    position: relative;
    display: inline-block;
    padding: 2px 20px 2px 36px;
    margin-bottom: 12px;
    border-radius: 12px;
    background-color: #fff;
    font-family: PingFang SC, Lantinghei SC, Helvetica Neue, Helvetica, Arial, Microsoft YaHei,
      微软雅黑, STHeitiSC-Light, simsun, 宋体, WenQuanYi Zen Hei, WenQuanYi Micro Hei, sans-serif;
    font-size: 12px;
    font-weight: 600;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.67;
    letter-spacing: normal;
    color: #36435c;

    .kubed-icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 8px;
      color: #329dce;
    }
  }
`;

const TitleWrapper = styled.div`
  margin-bottom: 4px;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  overflow: hidden;
  font-size: 20px;
  line-height: 1.4;
  font-family: Roboto, PingFang SC, Lantinghei SC, Helvetica Neue, Helvetica, Arial, Microsoft YaHei,
    微软雅黑, STHeitiSC-Light, simsun, 宋体, WenQuanYi Zen Hei, WenQuanYi Micro Hei, sans-serif;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  font-weight: 600;
  color: #36435c;
  display: flex;

  .kubed-icon {
    margin-right: 8px;
  }
`;

const Description = styled.div`
  margin-bottom: 12px;
  font-family: Roboto, PingFang SC, Lantinghei SC, Helvetica Neue, Helvetica, Arial, Microsoft YaHei,
    微软雅黑, STHeitiSC-Light, simsun, 宋体, WenQuanYi Zen Hei, WenQuanYi Micro Hei, sans-serif;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.67;
  letter-spacing: normal;
  color: #79879c;
  word-break: break-all;
`;

const DetailInfo = styled.div`
  padding: 12px;

  .detail-title {
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: 600;
  }
`;

const Detail = () => {
  const { name } = useParams();
  console.log(name);
  const { isLoading, data } = useQuery(
    ['sharing', name],
    () => {
      return request(`/apis/experimental.kubesphere.io/v1alpha1/sharingsecrets/${name}`);
    },
    {
      staleTime: 60 * 1000,
    },
  );

  const dataSource = data?.data;
  const descriptions = [
    { label: t('Name'), value: dataSource?.metadata.name },
    { label: t('Secret from'), value: dataSource?.spec.secretRef.name },
    { label: t('Namespaces'), value: dataSource?.spec.target },
  ];

  if (isLoading) {
    return <Loading className="page-loading" />;
  }

  return (
    <DetailWrapper>
      <ASide>
        <Card padding={0}>
          <BaseInfo>
            <Link to="/sharing-secret/list" className="back-link">
              <ChevronLeft size={20} />
              {t('Sharing_Manage')}
            </Link>
            <TitleWrapper>
              <Select size={28} />
              <span>{dataSource?.metadata.name}</span>
            </TitleWrapper>
            <Description>Sharing Secrets</Description>
          </BaseInfo>
          <DetailInfo>
            <div className="detail-title">详情</div>
            <Descriptions variant="unstyled" data={descriptions} />
          </DetailInfo>
        </Card>
      </ASide>
    </DetailWrapper>
  );
};

export default Detail;
