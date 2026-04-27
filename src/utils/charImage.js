// キャラ画像解決ユーティリティ — public/ 参照方式（仕様書 Phase5 §7）
// import.meta.glob を廃止し、/characters/{charId}/{faceKey}.png を静的生成
// 存在チェックは行わない（img の onError に委ねる）
export const getCharImageSrc = (charId, faceKey = 'default') => ({
  faceSrc: `/characters/${charId}/${faceKey}.png`,
  defaultSrc: `/characters/${charId}/default.png`,
})
