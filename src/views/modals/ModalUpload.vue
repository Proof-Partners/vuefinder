<template>
  <ModalLayout>
    <div>
      <ModalHeader :icon="UploadSVG" :title="t('Upload Files')"></ModalHeader>
      <div class="vuefinder__upload-modal__content">
        <div class="vuefinder__upload-modal__drop-area" ref="dropArea" @click="openFileSelector">
          <div class="pointer-events-none" v-if="hasFilesInDropArea">
            {{ t('Release to drop these files.') }}
          </div>
          <div class="pointer-events-none" v-else>
            {{ t('Drag and drop the files/folders to here or click here.') }}
          </div>
        </div>
        <div ref="container" class="vuefinder__upload-modal__buttons">
          <button ref="pickFiles" type="button" class="vf-btn vf-btn-secondary">
            {{ t('Select Files') }}
          </button>
          <button ref="pickFolders" type="button" class="vf-btn vf-btn-secondary">
            {{ t('Select Folders') }}
          </button>
          <button type="button" class="vf-btn vf-btn-secondary" :disabled="uploading" @click="clear(false)">
            {{ t('Clear all') }}
          </button>
          <button type="button" class="vf-btn vf-btn-secondary" :disabled="uploading" @click="clear(true)">
            {{ t('Clear only successful') }}
          </button>
        </div>
        <div class="vuefinder__upload-modal__file-list vf-scrollbar">
          <div class="vuefinder__upload-modal__file-entry" :key="entry.id" v-for="entry in queue">
            <span class="vuefinder__upload-modal__file-icon" :class="getClassNameForEntry(entry)">
              <span class="vuefinder__upload-modal__file-icon-text" v-text="getIconForEntry(entry)"></span>
            </span>
            <div class="vuefinder__upload-modal__file-info">
              <div class="vuefinder__upload-modal__file-name hidden md:block">{{ title_shorten(entry.name, 40) }} ({{
                entry.size }})</div>
              <div class="vuefinder__upload-modal__file-name md:hidden">{{ title_shorten(entry.name, 16) }} ({{
                entry.size }})</div>
              <div class="vuefinder__upload-modal__file-status" :class="getClassNameForEntry(entry)">
                {{ entry.statusName }}
                <b class="ml-auto" v-if="entry.status === definitions.QUEUE_ENTRY_STATUS.UPLOADING">{{ entry.percent
                  }}</b>
              </div>
            </div>
            <button type="button" class="vuefinder__upload-modal__file-remove" :class="uploading ? 'disabled' : ''"
              :title="t('Delete')" :disabled="uploading" @click="remove(entry)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="vuefinder__upload-modal__file-remove-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="py-2" v-if="!queue.length">{{ t('No files selected!') }}</div>
        </div>
        <SimpleMessage v-if="message.length" @hidden="message = ''" error>{{ message }}</SimpleMessage>
      </div>
    </div>
    <input ref="internalFileInput" type="file" multiple class="hidden">
    <input ref="internalFolderInput" type="file" multiple webkitdirectory class="hidden">

    <template v-slot:buttons>
      <button type="button" class="vf-btn vf-btn-primary" :disabled="uploading" @click.prevent="upload">
        {{ t('Upload') }}
      </button>
      <button type="button" class="vf-btn vf-btn-secondary" v-if="uploading" @click.prevent="cancel">{{ t('Cancel')
        }}</button>
      <button type="button" class="vf-btn vf-btn-secondary" v-else @click.prevent="close">{{ t('Close') }}</button>
    </template>
  </ModalLayout>
</template>

<script setup lang="ts">
import Uppy, { type Locale, type FileProgress, type UppyFile, type ErrorResponse, type FailedUppyFile } from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import ModalLayout from './ModalLayout.vue';
import { inject, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import SimpleMessage from '@/components/SimpleMessage.vue';
import { parse } from '@/utils/filesize.js';
import title_shorten from "@/utils/title_shorten.js";
import ModalHeader from "./ModalHeader.vue";
import UploadSVG from "@/icons/upload.svg";
import type { ServiceContainer } from '@/ServiceContainer';

const app = inject<ServiceContainer>('ServiceContainer')!;
const { t } = app.i18n;

const uppyLocale: Locale = t("uppy") as unknown as Locale;

const QUEUE_ENTRY_STATUS = {
  PENDING: 0,
  CANCELED: 1,
  UPLOADING: 2,
  ERROR: 3,
  DONE: 10,
}
const definitions = ref({ QUEUE_ENTRY_STATUS })

const container = useTemplateRef('container');
const internalFileInput = useTemplateRef('internalFileInput');
const internalFolderInput = useTemplateRef('internalFolderInput');
const pickFiles = useTemplateRef('pickFiles');
const pickFolders = useTemplateRef('pickFolders');
const dropArea = useTemplateRef('dropArea');
/**
 * @typedef {Object} QueueEntry
 * @property {String} id
 * @property {String} name File name
 * @property {String} size Formatted size
 * @property {?String} percent 0 to 100 progress value with "%" suffix
 * @property {Number} status Status, See QUEUE_ENTRY_STATUS
 * @property {String} statusName Status name
 * @property {File} originalFile
 */
type QueueEntry = {
  id: string,
  name: string,
  size: string,
  percent?: string,
  status: number,
  statusName: string,
  originalFile: UppyFile,
};

const queue = ref<QueueEntry[]>([]);
const message = ref('');
const uploading = ref(false);
const hasFilesInDropArea = ref(false);


let uppy: Uppy;


function findQueueEntryIndexById(id: string) {
  return queue.value.findIndex((item) => item.id === id);
}

function addFile(file: UppyFile, name?: string) {
  name = name != null ? name : (file.webkitRelativePath || file.name);
  uppy.addFile({
    name,
    type: file.type,
    data: file,
    source: 'Local',
  });
}

function getClassNameForEntry(entry: QueueEntry) {
  switch (entry.status) {
    case QUEUE_ENTRY_STATUS.DONE:
      return 'text-green-600'
    case QUEUE_ENTRY_STATUS.ERROR:
      return 'text-red-600';
    case QUEUE_ENTRY_STATUS.CANCELED:
      return 'text-red-600';
    case QUEUE_ENTRY_STATUS.PENDING:
    default:
      return '';
  }
}

const getIconForEntry = (entry: QueueEntry) => {
  switch (entry.status) {
    case QUEUE_ENTRY_STATUS.DONE:
      return '✓'
    case QUEUE_ENTRY_STATUS.ERROR:
    case QUEUE_ENTRY_STATUS.CANCELED:
      return '!';
    case QUEUE_ENTRY_STATUS.PENDING:
    default:
      return '...';
  }
}

/**
 * Open file selector
 */
function openFileSelector() {
  pickFiles.value!.click();
}

/**
 * Begin upload
 */
function upload() {
  if (uploading.value) {
    return;
  }
  if (!queue.value.filter(entry => entry.status !== QUEUE_ENTRY_STATUS.DONE).length) {
    message.value = t('Please select file to upload first.');
    return;
  }
  message.value = '';
  uppy.retryAll();
  uppy.upload();
}

/**
 * Cancel upload
 */
function cancel() {
  uppy.cancelAll({ reason: 'user' });
  queue.value.forEach(entry => {
    if (entry.status !== QUEUE_ENTRY_STATUS.DONE) {
      entry.status = QUEUE_ENTRY_STATUS.CANCELED;
      entry.statusName = t('Canceled');
    }
  });
  uploading.value = false;
}

function remove(file: QueueEntry) {
  if (uploading.value) {
    return;
  }
  uppy.removeFile(file.id, 'removed-by-user');
  queue.value.splice(findQueueEntryIndexById(file.id), 1);
}

function clear(onlySuccessful: boolean) {
  if (uploading.value) {
    return;
  }
  uppy.cancelAll({ reason: 'user' });
  if (onlySuccessful) {
    const retryQueue: QueueEntry[] = [];
    queue.value.forEach(entry => {
      if (entry.status !== QUEUE_ENTRY_STATUS.DONE) {
        retryQueue.push(entry);
      }
    });
    queue.value = [];
    retryQueue.forEach(entry => {
      addFile(entry.originalFile, entry.name);
    });
    return;
  }
  queue.value.splice(0);
}

/**
 * Close upload modal
 */
function close() {
  app.modal.close();
}

function buildReqParams() {
  return app.requester.transformRequestParams({
    url: '',
    method: 'post',
    params: { q: 'upload', adapter: app.fs.adapter.value, path: app.fs.data.dirname },
  });
}

onMounted(async () => {
  uppy = new Uppy({
    debug: app.debug,
    restrictions: {
      maxFileSize: parse(`${app.maxFileSize}`), //TOD is this correct?
      //maxNumberOfFiles
      //allowedFileTypes
    },
    locale: uppyLocale as unknown as Locale<string>,
    onBeforeFileAdded(file, files) {
      const duplicated = files[file.id] != null;
      if (duplicated) {
        const i = findQueueEntryIndexById(file.id);
        if (queue.value[i].status === QUEUE_ENTRY_STATUS.PENDING) {
          // Undocumented, as long as uppy don't change this we are good.
          message.value = uppy.i18n('noDuplicates', { fileName: file.name });
        }
        queue.value = queue.value.filter(entry => entry.id !== file.id);
      }
      // We only push the file in the end of queue, so user just need scroll down to find the newly selected stuff.
      queue.value.push({
        id: file.id,
        name: file.name,
        size: app.filesize(file.size),
        status: QUEUE_ENTRY_STATUS.PENDING,
        statusName: t('Pending upload'),
        originalFile: file.data,
      });
      return true;
      // Uppy would only upload that file once even you call .addFile() twice in one row, nice.
    }
  });

  uppy.use(XHR, {
    endpoint: 'WILL_BE_REPLACED_BEFORE_UPLOAD',
    limit: 5,
    timeout: 0,
    getResponseError(responseText: string) {
      let message: string;
      try {
        const body = JSON.parse(responseText);
        message = body.message;
      } catch (e: unknown) {
        message = t('Cannot parse server response.') + e;
      }
      return new Error(message);
    },
  });
  uppy.on('restriction-failed', (upFile, error) => {
    //remove the restricted file.
    const entry = queue.value[findQueueEntryIndexById(upFile.id)];
    remove(entry)
    message.value = error.message;
  });
  uppy.on('upload', () => {
    const reqParams = buildReqParams();
    uppy.setMeta({ ...reqParams.body });
    const xhrPlugin = uppy.getPlugin('XHRUpload')!;
    xhrPlugin.opts.method = reqParams.method;
    xhrPlugin.opts.endpoint = reqParams.url + '?' + new URLSearchParams(Object.entries(reqParams.params || {}).map(([k, v]) => [k, v?.toString() || '']));
    xhrPlugin.opts.headers = { ...reqParams.headers };
    delete xhrPlugin.headers['Content-Type'];
    uploading.value = true;
    queue.value.forEach(file => {
      if (file.status === QUEUE_ENTRY_STATUS.DONE) {
        return;
      }
      file.percent = undefined;
      file.status = QUEUE_ENTRY_STATUS.UPLOADING;
      file.statusName = t('Pending upload');
    });
  });
  uppy.on('upload-progress', (upFile: UppyFile, progress: FileProgress) => {
    // upFile.progress.percentage never updates itself during this callback, and progress param definition showed
    // some non exist properties, weird.
    const p = Math.floor(progress.bytesUploaded / progress.bytesTotal * 100);
    queue.value[findQueueEntryIndexById(upFile.id)].percent = `${p}%`;
  });
  uppy.on('upload-success', (upFile: UppyFile) => {
    const entry = queue.value[findQueueEntryIndexById(upFile.id)];
    entry.status = QUEUE_ENTRY_STATUS.DONE;
    entry.statusName = t('Done');
  });
  uppy.on('upload-error', (upFile: UppyFile, error: Error) => {
    const entry = queue.value[findQueueEntryIndexById(upFile.id)];
    entry.percent = undefined;
    entry.status = QUEUE_ENTRY_STATUS.ERROR;
    // https://uppy.io/docs/uppy/#upload-error
    // noinspection JSUnresolvedReference
    if (error.isNetworkError) {
      entry.statusName = t(`Network Error, Unable establish connection to the server or interrupted.`);
    } else {
      entry.statusName = error ? error.message : t('Unknown Error');
    }
  });
  uppy.on('error', (error) => {
    message.value = error.message;
    uploading.value = false;
    app.emitter.emit('vf-fetch', {
      params: { q: 'index', adapter: app.fs.adapter, path: app.fs.data.dirname },
      noCloseModal: true,
    });
  })
  uppy.on('complete', () => {
    uploading.value = false;
    app.emitter.emit('vf-fetch', {
      params: { q: 'index', adapter: app.fs.adapter, path: app.fs.data.dirname },
      noCloseModal: true,
    });
  });

  pickFiles.value.addEventListener('click', () => {
    internalFileInput.value.click();
  })
  pickFolders.value.addEventListener('click', () => {
    internalFolderInput.value.click();
  });
  dropArea.value.addEventListener('dragover', ev => {
    ev.preventDefault();
    hasFilesInDropArea.value = true;
  });
  dropArea.value.addEventListener('dragleave', ev => {
    ev.preventDefault();
    hasFilesInDropArea.value = false;
  });
  /**
   * @callback ResultCallback
   * @param {FileSystemEntry|FileSystemDirectoryEntry|FileSystemFileEntry} fileSystemEntry
   * @param {File} file
   */
  /**
   * Iterate through all dirs & files, will invoke resultCallback multiple times when read file
   * @param {ResultCallback} resultCallback
   * @param {FileSystemEntry|FileSystemDirectoryEntry|FileSystemFileEntry} item
   */
  function scanFiles(resultCallback, item) {
    if (item.isFile) {
      item.file(f => resultCallback(item, f));
    }
    if (item.isDirectory) {
      item.createReader().readEntries((entries) => {
        entries.forEach((entry) => {
          scanFiles(resultCallback, entry);
        });
      });
    }
  }
  dropArea.value.addEventListener('drop', ev => {
    ev.preventDefault();
    hasFilesInDropArea.value = false;
    const trimFileName = /^[/\\](.+)/;
    [...ev.dataTransfer.items].forEach(item => {
      if (item.kind === "file") {
        scanFiles((entry, file) => {
          const matched = trimFileName.exec(entry.fullPath);
          addFile(file, matched[1]);
        }, item.webkitGetAsEntry());
      }
    });
  });

  /**
   * File <input> change handler
   * @param {Event} event
   * @param {HTMLInputElement} event.target
   */
  const onFileInputChange = ({ target }) => {
    const files = target.files;
    for (const file of files) {
      addFile(file);
    }
    target.value = '';
  };
  internalFileInput.value.addEventListener('change', onFileInputChange);
  internalFolderInput.value.addEventListener('change', onFileInputChange);
});

onBeforeUnmount(() => {
  uppy?.close({ reason: 'unmount' });
});
</script>
