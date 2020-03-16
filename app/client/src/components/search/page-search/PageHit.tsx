import { ResultList } from '@appbaseio/reactivesearch';
import React from 'react';
import { baseUrl } from '../../../config';
import { Modal } from '../../shared/modal/Modal';
import { Hit, Search } from '../../../interfaces/index.d';

interface Props {
    page: Hit<Search.IndexPage>;
}

interface State {
    modal?: boolean;
}

export class PageHit extends React.Component<Props, State> {
    private toggleModal = () => {
        this.setState({ modal: !this?.state?.modal });
    };

    render() {
        const page = this?.props?.page;

        if (!page) {
            return null;
        }

        const imagePath = `${baseUrl}/documents/${page.document.id}/pages/${page.page.pageNumber}/files/pageImage.jpg`;

        const imageNotFound = e => {
            const img = e.currentTarget;
            img.src = '/imageNotFound.png';
            img.style.margin = '20px';
            img.style.width = '50px';
            img.style.height = '50px';
            img.style.minWidth = '50px';
            img.style.minHeight = '50px';
            img.classList.remove('clickable');
            img.onclick = e => {
                e.preventDefault();
                e.stopPropagation();
            };
        };

        return (
            <>
                <ResultList key={page._id}>
                    <ResultList.Image
                        onError={imageNotFound}
                        className="clickable"
                        onClick={this.toggleModal}
                        small={false}
                        src={imagePath}
                    />
                    <ResultList.Content>
                        <ResultList.Title
                            dangerouslySetInnerHTML={{ __html: page.document.filename }}
                        />
                        <ResultList.Description>
                            <div>
                                <div>{page.createdAt}</div>
                                Page {page.page.pageNumber} with {page.page.words?.length || 0}{' '}
                                words
                            </div>
                            <br />
                            <span>
                                <div>
                                    {page.page.fullText?.length > 500
                                        ? page.page.fullText?.slice(0, 500) + '...'
                                        : page.page.fullText}
                                </div>
                            </span>
                        </ResultList.Description>
                    </ResultList.Content>
                </ResultList>

                <Modal isOpen={this.state?.modal} onRequestClose={this.toggleModal}>
                    <div
                        className="bg-shadow"
                        style={{
                            height: '100%',
                            width: '100%',
                            backgroundImage: `url(${imagePath})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                </Modal>
            </>
        );
    }
}
