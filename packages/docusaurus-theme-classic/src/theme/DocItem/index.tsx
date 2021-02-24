/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState, useCallback} from 'react';
import clsx from 'clsx';

import {
  useActivePlugin,
  useVersions,
  useActiveVersion,
} from '@theme/hooks/useDocs';
import useLockBodyScroll from '@theme/hooks/useLockBodyScroll';
import DocPaginator from '@theme/DocPaginator';
import DocVersionSuggestions from '@theme/DocVersionSuggestions';
import Seo from '@theme/Seo';
import type {Props} from '@theme/DocItem';
import TOC, {Headings} from '@theme/TOC';
import EditThisPage from '@theme/EditThisPage';
import IconMenu from '@theme/IconMenu';

import styles from './styles.module.css';

function DocItem(props: Props): JSX.Element {
  const {content: DocContent} = props;
  const {
    metadata,
    frontMatter: {
      image,
      keywords,
      hide_title: hideTitle,
      hide_table_of_contents: hideTableOfContents,
    },
  } = DocContent;
  const {description, title, editUrl, lastUpdatedAt, lastUpdatedBy} = metadata;

  const {pluginId} = useActivePlugin({failfast: true});
  const versions = useVersions(pluginId);
  const version = useActiveVersion(pluginId);

  // If site is not versioned or only one version is included
  // we don't show the version badge
  // See https://github.com/facebook/docusaurus/issues/3362
  const showVersionBadge = versions.length > 1;

  const showToc = !hideTableOfContents && DocContent.toc;
  const [showMobileToc, setShowMobileToc] = useState(false);
  const toggleMobileToc = useCallback(() => {
    setShowMobileToc(!showMobileToc);
  }, [showMobileToc]);

  useLockBodyScroll(showMobileToc);

  return (
    <>
      <Seo {...{title, description, keywords, image}} />

      <div className="row">
        <div
          className={clsx('col', {
            [styles.docItemCol]: !hideTableOfContents,
          })}>
          <DocVersionSuggestions />
          <div className={styles.docItemContainer}>
            <article>
              {showVersionBadge && (
                <div>
                  <span className="badge badge--secondary">
                    Version: {version.label}
                  </span>
                </div>
              )}
              {!hideTitle && (
                <header>
                  <h1 className={styles.docTitle}>{title}</h1>
                </header>
              )}
              <div className="markdown">
                <DocContent />
              </div>
            </article>
            {(editUrl || lastUpdatedAt || lastUpdatedBy) && (
              <div className="margin-vert--xl">
                <div className="row">
                  <div className="col">
                    {editUrl && <EditThisPage editUrl={editUrl} />}
                  </div>
                  {(lastUpdatedAt || lastUpdatedBy) && (
                    <div className="col text--right">
                      <em>
                        <small>
                          {/* TODO: wait for using interpolation in translation function */}
                          Last updated{' '}
                          {lastUpdatedAt && (
                            <>
                              on{' '}
                              <time
                                dateTime={new Date(
                                  lastUpdatedAt * 1000,
                                ).toISOString()}
                                className={styles.docLastUpdatedAt}>
                                {new Date(
                                  lastUpdatedAt * 1000,
                                ).toLocaleDateString()}
                              </time>
                              {lastUpdatedBy && ' '}
                            </>
                          )}
                          {lastUpdatedBy && (
                            <>
                              by <strong>{lastUpdatedBy}</strong>
                            </>
                          )}
                          {process.env.NODE_ENV === 'development' && (
                            <div>
                              <small>
                                {' '}
                                (Simulated during dev for better perf)
                              </small>
                            </div>
                          )}
                        </small>
                      </em>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="margin-vert--lg">
              <DocPaginator metadata={metadata} />
            </div>
          </div>
        </div>
        {showToc && (
          <div className="col col--3">
            <TOC toc={DocContent.toc} />
          </div>
        )}
      </div>

      {showToc && (
        <>
          {/* TODO: Use Infima styles */}
          <div
            role="presentation"
            className={clsx(styles.mobileTocOverlay, {
              [styles.mobileTocOverlayOpened]: showMobileToc,
            })}
            onClick={toggleMobileToc}
          />

          <div
            className={clsx(styles.mobileToc, {
              [styles.mobileTocOpened]: showMobileToc,
            })}>
            <button
              type="button"
              className={clsx(
                'button button--secondary',
                styles.mobileTocCloseButton,
              )}
              onClick={toggleMobileToc}>
              ×
            </button>

            <div className={clsx(styles.mobileTocContent, 'thin-scrollbar')}>
              <Headings toc={DocContent.toc} onClick={toggleMobileToc} />
            </div>

            <button
              type="button"
              className={styles.mobileTocOpenButton}
              onClick={toggleMobileToc}>
              <IconMenu height={24} width={24} />
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default DocItem;
