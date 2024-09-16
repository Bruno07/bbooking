package main

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

var URL = "https://www.googleapis.com/books/v1/volumes"

type ListPrice struct {
	Amount       float32 `json:"amount"`
	CurrencyCode string  `json:"currencyCode"`
}

type SaleInfo struct {
	ListPrice ListPrice `json:"listPrice"`
}

type VolumeInfo struct {
	Title               string   `json:"title"`
	Authors             []string `json:"authors"`
	Publisher           string   `json:"publisher"`
	PublishedDate       string   `json:"publishedDate"`
	Description         string   `json:"description"`
	PageCount           int16    `json:"pageCount"`
	Categories          []string `json:"categories"`
	PrintType           string   `json:"printType"`
	MaturityRating      string   `json:"maturityRating"`
	AllowAnonLogging    bool     `json:"allowAnonLogging"`
	ContentVersion      string   `json:"contentVersion"`
	Language            string   `json:"language"`
	PreviewLink         string   `json:"previewLink"`
	InfoLink            string   `json:"infoLink"`
	CanonicalVolumeLink string   `json:"canonicalVolumeLink"`
}

type SubItems struct {
	Kind       string     `json:"kind"`
	ID         string     `json:"id"`
	Etag       string     `json:"etag"`
	SelfLink   string     `json:"selfLink"`
	VolumeInfo VolumeInfo `json:"volumeInfo"`
	SaleInfo   SaleInfo   `json:"saleInfo"`
}

type Items struct {
	Items []SubItems `json:"items"`
}

type BookResult struct {
	Kind       string `json:"kind"`
	TotalItems int64  `json:"totalItems"`
	Items
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/books", getBooks)
	r.HandleFunc("/books/{id}", getBook)

	// Configuração de CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	http.ListenAndServe(":5000", handler)
}

func getBooks(w http.ResponseWriter, r *http.Request) {
	q := strings.ReplaceAll(r.URL.Query().Get("q"), " ", "+")

	if q == "" {
		q = "Harry+Potter"
	}

	resp, err := http.Get(URL + "?q=" + q + "&filter=paid-ebooks")
	if err != nil {
		panic(err.Error())
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err.Error())
	}

	var bookResult BookResult
	if err := json.Unmarshal(body, &bookResult); err != nil {
		panic(err.Error())
	}

	json.NewEncoder(w).Encode(bookResult)
}

func getBook(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	resp, err := http.Get(URL + "/" + id)
	if err != nil {
		panic(err.Error())
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err.Error())
	}

	var subItem SubItems
	if err := json.Unmarshal(body, &subItem); err != nil {
		panic(err.Error())
	}

	json.NewEncoder(w).Encode(subItem)
}
